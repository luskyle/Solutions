import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { unzipSync, strFromU8 } from 'fflate';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { DiagramPage, EvidenceBlock, ParsedSource } from './types.js';

export const MAX_SOURCE_BYTES = 16 * 1024 * 1024;
const MAX_XML_BYTES = 8 * 1024 * 1024;
const TEXT = new Set(['.md', '.markdown', '.txt', '.cs', '.py', '.js', '.ts', '.json', '.xml', '.xsl', '.css', '.html', '.sql', '.rb', '.yml', '.yaml', '.csv', '.log']);
const IMAGES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp' };
type XmlNode = Record<string, unknown>;

export function supported(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return TEXT.has(ext) || Boolean(IMAGES[ext]) || ['.docx', '.pptx', '.drawio', '.dio'].includes(ext);
}

function isRecord(value: unknown): value is XmlNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function xml(content: string): XmlNode[] {
  if (Buffer.byteLength(content) > MAX_XML_BYTES || /<!DOCTYPE|<!ENTITY/i.test(content)) {
    throw new Error('XML exceeds limits or contains forbidden entity declarations');
  }
  const valid = XMLValidator.validate(content);
  if (valid !== true) throw new Error(`Invalid XML: ${valid.err.msg}`);
  const parsed: unknown = new XMLParser({
    preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: '',
    parseTagValue: false, trimValues: false, processEntities: false,
  }).parse(content);
  if (!Array.isArray(parsed)) throw new Error('Expected XML nodes');
  return parsed.filter(isRecord);
}

function nodes(value: unknown): XmlNode[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function attrs(node: XmlNode): Record<string, unknown> {
  return isRecord(node[':@']) ? node[':@'] : {};
}

function string(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function decodeEntities(value: string): string {
  return value.replace(/&#x([a-f0-9]+);|&#(\d+);|&(amp|lt|gt|quot|apos|nbsp);/gi, (whole, hex: string, decimal: string, name: string) => {
    if (hex || decimal) {
      const code = Number.parseInt(hex || decimal, hex ? 16 : 10);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' } as Record<string, string>)[name.toLowerCase()] || whole;
  });
}

function plainLabel(value: string): string {
  return decodeEntities(decodeEntities(value).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')).trim();
}

function find(all: XmlNode[], name: string): XmlNode[] {
  const result: XmlNode[] = [];
  for (const node of all) {
    if (name in node) result.push(node);
    for (const [key, value] of Object.entries(node)) {
      if (key !== ':@') result.push(...find(nodes(value), name));
    }
  }
  return result;
}

function text(all: XmlNode[]): string {
  let result = '';
  for (const node of all) {
    for (const [key, value] of Object.entries(node)) {
      if (key === '#text') result += decodeEntities(string(value));
      else if (['w:tab', 'a:tab'].includes(key)) result += '\t';
      else if (['w:br', 'a:br'].includes(key)) result += '\n';
      else if (key !== ':@') result += text(nodes(value));
    }
  }
  return result;
}

function archive(bytes: Uint8Array): Record<string, Uint8Array> {
  let expanded = 0;
  let count = 0;
  return unzipSync(bytes, { filter(entry) {
    if (++count > 3000) throw new Error('Archive has more than 3,000 entries');
    if (!entry.name.endsWith('.xml') && !entry.name.endsWith('.rels')) return false;
    if (entry.originalSize > MAX_XML_BYTES || (expanded += entry.originalSize) > 48 * 1024 * 1024) {
      throw new Error('Archive XML decompression exceeds limits');
    }
    return true;
  } });
}

function requireEntry(entries: Record<string, Uint8Array>, name: string): XmlNode[] {
  const entry = entries[name];
  if (!entry) throw new Error(`Archive is missing ${name}`);
  return xml(strFromU8(entry));
}

function paragraphs(all: XmlNode[], tag: string, prefix: string): EvidenceBlock[] {
  return find(all, tag).map((node, index) => ({
    id: `${prefix}-${index + 1}`, label: `${prefix} · 段落 ${index + 1}`, text: text(nodes(node[tag])).trim(),
  })).filter(block => block.text);
}

function parseWord(bytes: Uint8Array, title: string): ParsedSource {
  const entries = archive(bytes);
  const blocks = paragraphs(requireEntry(entries, 'word/document.xml'), 'w:p', '正文');
  for (const name of Object.keys(entries).filter(name => /^word\/(footnotes|endnotes|header\d+|footer\d+)\.xml$/.test(name)).sort()) {
    blocks.push(...paragraphs(requireEntry(entries, name), 'w:p', name));
  }
  return { kind: 'word', title, blocks, notice: '结构阅读：正文、表格中的段落及可用注释。不是 Word 原版式渲染；未提取的图片与嵌入对象请用原生应用查看。' };
}

function parseSlides(bytes: Uint8Array, title: string): ParsedSource {
  const entries = archive(bytes);
  const presentation = requireEntry(entries, 'ppt/presentation.xml');
  const relationsBytes = entries['ppt/_rels/presentation.xml.rels'];
  if (!relationsBytes) throw new Error('PPTX is missing presentation relationships');
  const relations = new Map(find(xml(strFromU8(relationsBytes)), 'Relationship').map(node => {
    const values = attrs(node);
    return [string(values.Id), string(values.Target)];
  }));
  const blocks: EvidenceBlock[] = [];
  for (const [index, node] of find(presentation, 'p:sldId').entries()) {
    const target = relations.get(string(attrs(node)['r:id']));
    if (!target || target.startsWith('/') || target.includes('..')) throw new Error('Invalid slide relationship');
    const name = path.posix.join('ppt', target);
    const paragraphsInSlide = paragraphs(requireEntry(entries, name), 'a:p', `幻灯片 ${index + 1}`);
    const relationshipPath = path.posix.join(path.posix.dirname(name), '_rels', `${path.posix.basename(name)}.rels`);
    const relationship = entries[relationshipPath];
    let notes = '';
    if (relationship) {
      const note = find(xml(strFromU8(relationship)), 'Relationship').find(item => string(attrs(item).Type).endsWith('/notesSlide'));
      if (note) {
        const noteTarget = path.posix.normalize(path.posix.join(path.posix.dirname(name), string(attrs(note).Target)));
        if (!noteTarget.startsWith('ppt/notesSlides/')) throw new Error('Invalid notes relationship');
        notes = paragraphs(requireEntry(entries, noteTarget), 'a:p', '备注').map(item => item.text).join('\n');
      }
    }
    blocks.push({ id: `slide-${index + 1}`, label: `幻灯片 ${index + 1}`,
      text: paragraphsInSlide.map(item => item.text).join('\n') + (notes ? `\n\n备注：\n${notes}` : '') });
  }
  return { kind: 'slides', title, blocks, notice: '按演示顺序提取文字与备注，不是 PowerPoint 页面像素级渲染；图表、动画与嵌入媒体请用原生应用查看。' };
}

function parseDiagram(bytes: Uint8Array, title: string, legacy: boolean): ParsedSource {
  const { content } = decode(bytes, legacy);
  const source = xml(content);
  const pages = find(source, 'diagram');
  const roots = pages.length ? pages : [{ mxGraphModel: source }];
  const diagrams: DiagramPage[] = [];
  const blocks: EvidenceBlock[] = [];
  for (const [index, page] of roots.entries()) {
    let graph = nodes(page.diagram);
    if (!find(graph, 'mxGraphModel').length && pages.length) {
      const compressed = text(graph).trim();
      if (!/^[a-zA-Z0-9+/=\s]+$/.test(compressed)) throw new Error('Invalid compressed draw.io page');
      const inflated = inflateRawSync(Buffer.from(compressed, 'base64'), { maxOutputLength: MAX_XML_BYTES });
      graph = xml(decodeURIComponent(inflated.toString('utf8')));
    }
    if (!pages.length) graph = source;
    const label = string(attrs(page).name) || `图页 ${index + 1}`;
    const diagram: DiagramPage = { label, nodes: [], edges: [] };
    for (const cell of find(graph, 'mxCell')) {
      const data = attrs(cell);
      const id = string(data.id);
      const value = plainLabel(string(data.value));
      if (string(data.vertex) === '1') {
        const geometry = find(nodes(cell.mxCell), 'mxGeometry')[0];
        const position = geometry ? attrs(geometry) : {};
        const numeric = (key: string, fallback: number) => {
          const number = Number(position[key]);
          return Number.isFinite(number) ? Math.min(Math.max(number, -10000), 10000) : fallback;
        };
        diagram.nodes.push({ id, label: value || id, x: numeric('x', 0), y: numeric('y', 0),
          width: Math.max(numeric('width', 120), 20), height: Math.max(numeric('height', 50), 20) });
      } else if (string(data.edge) === '1') {
        diagram.edges.push({ source: string(data.source), target: string(data.target), label: value });
      }
    }
    if (diagram.nodes.length > 2000 || diagram.edges.length > 4000) throw new Error('Diagram exceeds 2,000 nodes or 4,000 edges');
    for (const node of diagram.nodes) blocks.push({ id: `page-${index + 1}-node-${node.id}`, label: `${label} · 节点 ${node.id}`, text: node.label });
    for (const [edgeIndex, edge] of diagram.edges.entries()) {
      const lookup = (id: string) => diagram.nodes.find(node => node.id === id)?.label || id;
      blocks.push({ id: `page-${index + 1}-edge-${edgeIndex}`, label: `${label} · 原图连线`,
        text: `${lookup(edge.source)} → ${edge.label ? `${edge.label} → ` : ''}${lookup(edge.target)}` });
    }
    diagrams.push(diagram);
  }
  return { kind: 'diagram', title, blocks, diagrams, notice: '读取原图节点与连线并简化绘制；线条表达原图关系，不是 AI 推断。复杂分组与样式可能不同于 draw.io。' };
}

function decode(bytes: Uint8Array, legacy: boolean): { content: string; encoding: string } {
  const bom = bytes[0] === 255 && bytes[1] === 254 ? 'utf-16le' : bytes[0] === 254 && bytes[1] === 255 ? 'utf-16be' : 'utf-8';
  try {
    return { content: new TextDecoder(bom, { fatal: true }).decode(bytes), encoding: bom };
  } catch (error) {
    if (!legacy || bom !== 'utf-8') throw new Error('无法解码文件；旧中文资料可在设置中显式启用 GB18030 回退', { cause: error });
    return { content: new TextDecoder('gb18030', { fatal: true }).decode(bytes), encoding: 'gb18030' };
  }
}

export function parseSource(name: string, bytes: Uint8Array, legacy = false): ParsedSource {
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error('文件超过 16 MiB 上限');
  const ext = path.extname(name).toLowerCase();
  const title = path.basename(name);
  if (ext === '.docx') return parseWord(bytes, title);
  if (ext === '.pptx') return parseSlides(bytes, title);
  if (ext === '.drawio' || ext === '.dio') return parseDiagram(bytes, title, legacy);
  if (IMAGES[ext]) return { kind: 'image', title, blocks: [], imageMime: IMAGES[ext], notice: '原图预览。此版本没有 OCR 或视觉模型，图片内容尚不可全文检索。' };
  if (!TEXT.has(ext)) throw new Error('暂不支持解析此格式，可用系统应用打开原文件');
  const decoded = decode(bytes, legacy);
  const content = decoded.content.replace(/\r\n?/g, '\n');
  if (content.includes('\0')) throw new Error('文件包含二进制内容');
  const lines = content.split('\n');
  const blocks: EvidenceBlock[] = [];
  for (let start = 0; start < lines.length; start += 40) {
    blocks.push({ id: `line-${start + 1}`, label: `第 ${start + 1}–${Math.min(start + 40, lines.length)} 行`,
      line: start + 1, text: lines.slice(start, start + 40).join('\n') });
  }
  return { kind: 'text', title, blocks, encoding: decoded.encoding };
}
