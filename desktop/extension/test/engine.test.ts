import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { zipSync, strToU8 } from 'fflate';
import { parseSource, MAX_SOURCE_BYTES } from '../src/parsers.ts';
import { WorkspaceKnowledge } from '../src/workspace.ts';
import { GitHistory } from '../src/history.ts';
import { escape, sourceContent } from '../src/render.ts';

function zip(entries: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, strToU8(value)])));
}

function word(body: string): Uint8Array {
  return zip({ 'word/document.xml': `<w:document xmlns:w="urn:word"><w:body>${body}</w:body></w:document>` });
}

const diagram = `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="a" value="需求评审" vertex="1" parent="1"><mxGeometry x="10" y="20" width="100" height="50" as="geometry"/></mxCell>
<mxCell id="b" value="&lt;b&gt;实施&lt;/b&gt;" vertex="1" parent="1"><mxGeometry x="210" y="20" width="100" height="50" as="geometry"/></mxCell>
<mxCell id="e" value="通过" edge="1" source="a" target="b" parent="1"/></root></mxGraphModel>`;

test('Markdown and text retain source line anchors and encoding boundaries', () => {
  assert.deepEqual(parseSource('a.md', Buffer.from('# 标题\r\nEvidence')).blocks, [{
    id: 'line-1', label: '第 1–2 行', line: 1, text: '# 标题\nEvidence',
  }]);
  assert.throws(() => parseSource('old.txt', Buffer.from([0xd6, 0xd0, 0xce, 0xc4])), /GB18030/);
  assert.equal(parseSource('old.txt', Buffer.from([0xd6, 0xd0, 0xce, 0xc4]), true).blocks[0]?.text, '中文');
  assert.equal(parseSource('bom.txt', Buffer.concat([Buffer.from([255, 254]), Buffer.from('中文', 'utf16le')])).blocks[0]?.text, '中文');
});

test('DOCX extracts ordered paragraphs including table cells and escapes XML entities', () => {
  const parsed = parseSource('需求.docx', word(`<w:p><w:r><w:t>需求 &amp; 约束</w:t></w:r></w:p>
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>审批</w:t><w:tab/><w:t>人工复核</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`));
  assert.equal(parsed.kind, 'word');
  assert.deepEqual(parsed.blocks.map(block => block.text), ['需求 & 约束', '审批\t人工复核']);
  assert.match(parsed.notice || '', /不是 Word 原版式/);
});

test('PPTX follows presentation relationships rather than filename order and preserves linked notes', () => {
  const bytes = zip({
    'ppt/presentation.xml': '<p:presentation xmlns:p="urn:p" xmlns:r="urn:r"><p:sldIdLst><p:sldId r:id="second"/><p:sldId r:id="first"/></p:sldIdLst></p:presentation>',
    'ppt/_rels/presentation.xml.rels': '<Relationships><Relationship Id="first" Target="slides/slide1.xml"/><Relationship Id="second" Target="slides/slide2.xml"/></Relationships>',
    'ppt/slides/slide1.xml': '<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><a:p><a:r><a:t>后展示</a:t></a:r></a:p></p:sld>',
    'ppt/slides/slide2.xml': '<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><a:p><a:r><a:t>先展示</a:t></a:r></a:p></p:sld>',
    'ppt/slides/_rels/slide2.xml.rels': '<Relationships><Relationship Type="urn:office/notesSlide" Target="../notesSlides/notesSlide9.xml"/></Relationships>',
    'ppt/notesSlides/notesSlide9.xml': '<p:notes xmlns:p="urn:p" xmlns:a="urn:a"><a:p><a:r><a:t>评审备注</a:t></a:r></a:p></p:notes>',
  });
  const parsed = parseSource('方案.pptx', bytes);
  assert.deepEqual(parsed.blocks.map(block => [block.id, block.text]), [
    ['slide-1', '先展示\n\n备注：\n评审备注'], ['slide-2', '后展示'],
  ]);
});

test('draw.io reads original nodes and directional edges in compressed and plain formats', () => {
  const compressed = deflateRawSync(Buffer.from(encodeURIComponent(diagram))).toString('base64');
  const files = [
    `<mxfile><diagram name="主流程">${diagram}</diagram></mxfile>`,
    `<mxfile><diagram name="主流程">${compressed}</diagram></mxfile>`,
    diagram,
  ];
  for (const content of files) {
    const parsed = parseSource('流程.drawio', Buffer.from(content));
    assert.deepEqual(parsed.diagrams?.[0]?.nodes.map(node => node.label), ['需求评审', '实施']);
    assert.deepEqual(parsed.diagrams?.[0]?.edges, [{ source: 'a', target: 'b', label: '通过' }]);
    assert.equal(parsed.blocks.at(-1)?.text, '需求评审 → 通过 → 实施');
  }
});

test('malformed, unsupported, oversized and entity-bearing inputs report errors', () => {
  assert.throws(() => parseSource('a.doc', Buffer.from('old format')), /暂不支持/);
  assert.throws(() => parseSource('a.docx', zip({ 'wrong.xml': '<a/>' })), /missing/);
  assert.throws(() => parseSource('a.drawio', Buffer.from('<mxfile>')), /Invalid XML/);
  assert.throws(() => parseSource('a.drawio', Buffer.from('<!DOCTYPE mxfile><mxfile/>')), /forbidden/);
  assert.throws(() => parseSource('a.txt', new Uint8Array(MAX_SOURCE_BYTES + 1)), /16 MiB/);
  assert.throws(() => parseSource('a.docx', zip({ 'word/document.xml': 'x'.repeat(8 * 1024 * 1024 + 1) })), /decompression/);
});

test('images have honest preview-only status and HTML rendering never executes source markup', () => {
  const image = parseSource('image.png', Buffer.from([137, 80, 78, 71]));
  assert.equal(image.kind, 'image');
  assert.deepEqual(image.blocks, []);
  assert.match(image.notice || '', /没有 OCR/);
  assert.equal(escape('<script>'), '&lt;script&gt;');
  const html = sourceContent(parseSource('text.md', Buffer.from('<img src=x onerror=alert(1)>')), 'text.md');
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img src=x'));
});

test('workspace keeps folder scopes, reports formats and updates after edits, moves and deletion', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'knowledge-desktop-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await Promise.all(['project', 'project-two', 'offline', '.hidden'].map(name => mkdir(path.join(root, name))));
  await Promise.all([
    writeFile(path.join(root, 'project', '需求.docx'), word('<w:p><w:r><w:t>人工复核</w:t></w:r></w:p>')),
    writeFile(path.join(root, 'project-two', 'other.md'), '# 同名项目\n人工复核'),
    writeFile(path.join(root, 'root.md'), '# Root\n`NPOI`'),
    writeFile(path.join(root, 'broken.docx'), 'broken zip'),
    writeFile(path.join(root, 'old.doc'), 'unsupported'),
    writeFile(path.join(root, 'offline', 'private.md'), 'private'),
    writeFile(path.join(root, '.hidden', 'private.md'), 'private'),
  ]);
  await symlink(path.join(root, 'root.md'), path.join(root, 'link.md'));
  const knowledge = new WorkspaceKnowledge(root, ['offline']);
  assert.deepEqual(await knowledge.scan(), { ready: 3, failed: 1, unsupported: 1, skipped: 3, truncated: false });
  assert.equal(knowledge.search('人工复核', 'project').length, 1);
  assert.equal(knowledge.search('人工复核').length, 2);
  assert.equal(knowledge.search('private').length, 0);
  assert.ok(knowledge.directories.has('project'));
  await assert.rejects(() => knowledge.safePath('../outside'), /范围/);
  await assert.rejects(() => knowledge.read('link.md'), /符号链接/);
  await writeFile(path.join(root, 'root.md'), '# Updated\nChanged');
  await rename(path.join(root, 'project', '需求.docx'), path.join(root, 'project', 'new.docx'));
  await rm(path.join(root, 'project-two', 'other.md'));
  await knowledge.scan();
  assert.equal(knowledge.search('NPOI').length, 0);
  assert.equal(knowledge.search('Changed').length, 1);
  assert.deepEqual(knowledge.sources('project').map(source => source.relativePath), ['project/new.docx']);
});

test('Git history reads old structured sources without checkout and detects uncommitted changes', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'knowledge-git-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.invalid');
  await mkdir(path.join(root, 'scope'));
  await writeFile(path.join(root, 'scope', 'requirements.docx'), word('<w:p><w:r><w:t>旧规则</w:t></w:r></w:p>'));
  git('add', '.');
  git('commit', '-qm', 'Initial requirements');
  const first = git('rev-parse', 'HEAD');
  await writeFile(path.join(root, 'scope', 'requirements.docx'), word('<w:p><w:r><w:t>增加人工复核</w:t></w:r></w:p>'));
  const before = await readFile(path.join(root, 'scope', 'requirements.docx'));
  const knowledge = new WorkspaceKnowledge(root, []);
  await knowledge.scan();
  const history = new GitHistory(knowledge, { ...process.env, GIT_CONFIG_COUNT: '3', GIT_CONFIG_KEY_0: 'test.injected' });
  const entries = await history.list('scope');
  assert.equal(entries.entries[0]?.commit, first);
  assert.equal(entries.dirty, true);
  assert.equal((await history.snapshot('scope/requirements.docx', first)).blocks[0]?.text, '旧规则');
  assert.match(await history.diff('scope/requirements.docx', first), /Binary files/);
  assert.deepEqual(await readFile(path.join(root, 'scope', 'requirements.docx')), before);
  assert.equal(git('rev-parse', 'HEAD'), first);
  await assert.rejects(() => history.snapshot('scope/requirements.docx', '--help'), /完整提交/);
  await assert.rejects(() => history.snapshot('../outside', first), /范围/);
});
