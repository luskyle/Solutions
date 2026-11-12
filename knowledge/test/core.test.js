import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { KnowledgeBase, MAX_BYTES, parseContent } from '../core.js';
import { validateAssertions } from '../model.js';

async function database(t) {
  const kb = await KnowledgeBase.open(':memory:');
  t.after(() => kb.close());
  return kb;
}

function importNote(kb, key = 'note', text = '# Excel 导出\n使用 `NPOI` 导出 Excel 表格。\n') {
  return kb.importContent(key, `${key}.md`, Buffer.from(text));
}

function saveFact(kb, id, fields = {}) {
  const chunk = kb.chunks(id)[0];
  const [fact] = validateAssertions({ assertions: [{
    subject: 'NPOI', predicate: '适用于', object: 'Excel 导出',
    quote: '使用 `NPOI` 导出 Excel 表格。', qualifier: '', ...fields,
  }] }, chunk);
  return kb.saveAssertions(id, kb.db.prepare('SELECT hash FROM documents WHERE id=?').get(id).hash, [fact]);
}

test('parsing is bounded, UTF-8 only, and preserves line locations', () => {
  const parsed = parseContent('sample.md', Buffer.from('# 标题\r\n第一行\r\n第二行'));
  assert.equal(parsed.title, '标题');
  assert.equal(parsed.chunks[0].startLine, 1);
  assert.equal(parsed.chunks[0].endLine, 3);
  assert.equal(parsed.content, '# 标题\n第一行\n第二行');
  assert.throws(() => parseContent('a.pdf', Buffer.from('text')), /Unsupported/);
  assert.throws(() => parseContent('a.txt', Buffer.from([0xff])), /Cannot decode/);
  assert.throws(() => parseContent('a.txt', Buffer.from('a\0b')), /Binary/);
  assert.throws(() => parseContent('a.txt', Buffer.from(' \n')), /Empty/);
  assert.throws(() => parseContent('a.txt', Buffer.alloc(MAX_BYTES + 1)), /2 MiB/);
  assert.throws(() => parseContent('a.txt', Buffer.from('a'.repeat(12001))), /12,000/);
  const manyLines = parseContent('a.txt', Buffer.from(Array.from({ length: 121 }, (_, i) => `行 ${i}`).join('\n')));
  assert.deepEqual(manyLines.chunks.map((chunk) => [chunk.startLine, chunk.endLine]), [[1, 60], [61, 120], [121, 121]]);
});

test('BOM encodings are recognized and legacy Chinese decoding requires explicit opt-in', () => {
  const utf16 = parseContent('a.txt', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('中文', 'utf16le')]));
  assert.equal(utf16.content, '中文');
  assert.equal(utf16.encoding, 'utf-16le');
  const gb = Buffer.from([0xd6, 0xd0, 0xce, 0xc4]);
  assert.throws(() => parseContent('a.txt', gb), /GB18030/);
  const parsed = parseContent('a.txt', gb, { legacyEncoding: 'gb18030' });
  assert.equal(parsed.content, '中文');
  assert.equal(parsed.encoding, 'gb18030');
  assert.throws(() => parseContent('a.txt', Buffer.from('text'), { legacyEncoding: 'random' }), /only supported/);
});

test('import is incremental and Chinese / English search returns source evidence', async (t) => {
  const kb = await database(t);
  const first = importNote(kb);
  assert.equal(first.status, 'imported');
  assert.equal(importNote(kb).status, 'unchanged');
  assert.equal(kb.document(first.id).version, 1);
  const hits = kb.search('导出');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].document_id, first.id);
  assert.match(hits[0].excerpt, /NPOI/);
  assert.equal(hits[0].start_line, 1);
  assert.equal(kb.search('NPOI Excel').length, 1);
  assert.deepEqual(kb.search('不存在'), []);
  assert.deepEqual(kb.search(''), []);
  assert.doesNotThrow(() => kb.search('" OR * NEAR(test)'));
  const updated = importNote(kb, 'note', '# 新主题\n打印机故障排查。');
  assert.equal(updated.id, first.id);
  assert.equal(updated.status, 'updated');
  assert.equal(kb.document(first.id).version, 2);
  assert.equal(kb.search('NPOI').length, 0);
  assert.equal(kb.search('打印机').length, 1);
  assert.equal(kb.graph({ documentId: first.id }).edges.length, 0);
  assert.throws(() => kb.importContent('note', 'note.md', Buffer.from([0xff])));
  assert.equal(kb.document(first.id).version, 2);
});

test('structural graph expresses mentions, not inferred dependencies, across fenced chunks', async (t) => {
  const kb = await database(t);
  const { id } = importNote(kb, 'fences', [
    '# Code', '`NPOI`', '```js',
    ...Array(65).fill('const value = "`FakeConcept`";'),
    '```', '`WinForms`', '<script>alert(1)</script>',
  ].join('\n'));
  const doc = kb.document(id);
  assert.deepEqual(doc.mentions.map((mention) => mention.label), ['NPOI', 'WinForms']);
  const graph = kb.graph({ documentId: id });
  assert.equal(graph.edges.length, 2);
  assert.ok(graph.edges.every((edge) => edge.label === '提及' && edge.status === 'observed'));
  assert.ok(graph.nodes.some((node) => node.label === 'NPOI'));
  const concept = graph.nodes.find((node) => node.label === 'NPOI');
  assert.equal(kb.graph({ conceptId: concept.id }).edges.length, 1);
  assert.deepEqual(kb.graph().nodes, []);
});

test('assertions have verified quotes, review state survives extraction and reindexing', async (t) => {
  const kb = await database(t);
  const { id } = importNote(kb);
  saveFact(kb, id);
  let doc = kb.document(id);
  assert.equal(doc.assertions[0].status, 'pending');
  assert.equal(doc.assertions[0].start_line, 2);
  assert.equal(kb.graph({ documentId: id }).edges.filter((edge) => edge.method === 'ollama').length, 0);
  assert.equal(kb.graph({ documentId: id, includePending: true }).edges.length, 2);
  kb.review(doc.assertions[0].id, 'accepted');
  saveFact(kb, id);
  doc = kb.document(id);
  assert.equal(doc.assertions[0].status, 'accepted');
  assert.equal(kb.graph({ documentId: id }).edges.filter((edge) => edge.method === 'ollama').length, 1);
  importNote(kb, 'note', '# Excel 导出\n使用 `NPOI` 导出 Excel 表格。\n新增说明。');
  assert.equal(kb.document(id).assertions.length, 0);
  saveFact(kb, id);
  assert.equal(kb.document(id).assertions[0].status, 'accepted');
  kb.review(kb.document(id).assertions[0].id, 'rejected');
  assert.equal(kb.graph({ documentId: id, includePending: true }).edges.length, 1);
  assert.throws(() => kb.review(doc.assertions[0].id, 'accepted'), /not found/);
  assert.throws(() => kb.review(kb.document(id).assertions[0].id, 'probably'), /Invalid/);
});

test('deleting a source removes its indexes and assertions but retains other evidence', async (t) => {
  const kb = await database(t);
  const first = importNote(kb, 'one');
  const second = importNote(kb, 'two');
  saveFact(kb, first.id);
  saveFact(kb, second.id);
  kb.remove(first.id);
  assert.equal(kb.search('NPOI').length, 1);
  assert.equal(kb.search('NPOI')[0].document_id, second.id);
  assert.equal(kb.document(second.id).assertions.length, 1);
  assert.throws(() => kb.document(first.id), /not found/);
  assert.throws(() => kb.remove(first.id), /not found/);
  kb.remove(second.id);
  assert.equal(kb.search('NPOI').length, 0);
  assert.equal(kb.db.prepare('SELECT count(*) AS n FROM concepts').get().n, 0);
  assert.equal(kb.db.prepare('SELECT count(*) AS n FROM chunks_fts').get().n, 0);
});

test('directory import skips private, hidden, symlink and unsupported inputs; reports failures', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'solutions-knowledge-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const kb = await database(t);
  await Promise.all(['offline', '.hidden', 'nested'].map((name) => mkdir(path.join(directory, name))));
  await Promise.all([
    writeFile(path.join(directory, 'visible.md'), '# Visible\n`NPOI`'),
    writeFile(path.join(directory, 'empty.txt'), ''),
    writeFile(path.join(directory, 'scan.pdf'), 'not parsed'),
    writeFile(path.join(directory, 'offline', 'private.md'), 'do not import'),
    writeFile(path.join(directory, '.hidden', 'private.md'), 'do not import'),
    writeFile(path.join(directory, 'nested', 'a.cs'), 'class Code {}'),
    symlink(path.join(directory, 'visible.md'), path.join(directory, 'linked.md')),
  ]);
  const report = await kb.importDirectory(directory);
  assert.equal(report.imported, 2);
  assert.equal(report.failed.length, 1);
  assert.equal(report.failed[0].name, 'empty.txt');
  assert.equal(report.skipped.length, 4);
  assert.equal(kb.search('private').length, 0);
  assert.equal((await kb.importDirectory(directory)).unchanged, 2);
  await assert.rejects(() => kb.importDirectory(path.join(directory, 'offline')), /private/);
  const link = path.join(directory, 'linked-directory');
  await symlink(path.join(directory, 'nested'), link);
  await assert.rejects(() => kb.importDirectory(link), /symbolic link/);
});

test('persistent database reopens with private permissions and retained data', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'solutions-persist-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = path.join(directory, 'data', 'knowledge.sqlite');
  let kb = await KnowledgeBase.open(filename);
  const { id } = importNote(kb);
  kb.close();
  kb = await KnowledgeBase.open(filename);
  t.after(() => kb.close());
  assert.equal(kb.document(id).title, 'Excel 导出');
  assert.equal(kb.search('导出').length, 1);
  assert.equal((await stat(filename)).mode & 0o777, 0o600);
  assert.equal((await stat(path.dirname(filename))).mode & 0o777, 0o700);
});
