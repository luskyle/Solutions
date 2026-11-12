import test from 'node:test';
import assert from 'node:assert/strict';
import { KnowledgeBase } from '../core.js';
import { extractDocument, localEndpoint, validateAssertions } from '../model.js';

async function fixture(t) {
  const kb = await KnowledgeBase.open(':memory:');
  t.after(() => kb.close());
  const { id } = kb.importContent('test', 'test.md', Buffer.from('# Example\nNPOI 用于 Excel 导出。\n仅限此示例。'));
  return { kb, id };
}

const fact = { subject: 'NPOI', predicate: '适用于', object: 'Excel 导出', quote: 'NPOI 用于 Excel 导出。', qualifier: '仅限此示例' };
const reply = (assertions) => new Response(JSON.stringify({ message: { content: JSON.stringify({ assertions }) } }));

test('only explicit loopback Ollama origins are accepted', () => {
  assert.equal(localEndpoint('http://127.0.0.1:11434'), 'http://127.0.0.1:11434');
  assert.equal(localEndpoint('http://[::1]:11434'), 'http://[::1]:11434');
  for (const url of ['https://example.com', 'http://localhost:11434', 'http://192.168.1.1', 'http://127.0.0.1/proxy',
    'http://user:pass@127.0.0.1', 'http://127.0.0.1?target=remote']) {
    assert.throws(() => localEndpoint(url), /loopback/);
  }
});

test('assertion schema rejects invented quotes, unsupported predicates, and missing conditions', () => {
  const chunk = { id: 1, start_line: 4, text: '第一行\nNPOI 用于 Excel 导出。\n仅限此示例。' };
  assert.equal(validateAssertions({ assertions: [fact] }, chunk)[0].startLine, 5);
  assert.throws(() => validateAssertions({ assertions: [{ ...fact, quote: 'invented quote' }] }, chunk), /exact quote/);
  assert.throws(() => validateAssertions({ assertions: [{ ...fact, predicate: '相关' }] }, chunk), /predicate/);
  assert.throws(() => validateAssertions({ assertions: [{ ...fact, qualifier: undefined }] }, chunk), /qualifier/);
  assert.throws(() => validateAssertions({ assertions: Array(31).fill(fact) }, chunk), /30/);
  assert.throws(() => validateAssertions({}, chunk), /array/);
});

test('optional model extraction is explicit, bounded and produces only pending candidates', async (t) => {
  const { kb, id } = await fixture(t);
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    assert.equal(options.redirect, 'error');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'local-test');
    assert.equal(body.stream, false);
    assert.match(body.messages[1].content, /NPOI/);
    return reply([fact]);
  };
  await assert.rejects(() => extractDocument(kb, id, { fetchImpl }), /installed/);
  assert.equal(calls, 0);
  assert.deepEqual(await extractDocument(kb, id, { model: 'local-test', fetchImpl }), { extracted: 1 });
  assert.equal(calls, 1);
  assert.equal(kb.document(id).assertions[0].status, 'pending');
});

test('invalid / failed / oversized responses do not replace previous assertions', async (t) => {
  const { kb, id } = await fixture(t);
  await extractDocument(kb, id, { model: 'test', fetchImpl: async () => reply([fact]) });
  const original = kb.document(id).assertions[0].id;
  for (const fetchImpl of [
    async () => reply([{ ...fact, quote: 'invented' }]),
    async () => new Response('Unavailable', { status: 503 }),
    async () => new Response('invalid json'),
    async () => new Response('x'.repeat(256 * 1024 + 1)),
    async () => new Response('{}'),
  ]) {
    await assert.rejects(() => extractDocument(kb, id, { model: 'test', fetchImpl }));
    assert.equal(kb.document(id).assertions[0].id, original);
  }
});

test('concurrent source changes invalidate extraction instead of attaching stale evidence', async (t) => {
  const { kb, id } = await fixture(t);
  await assert.rejects(() => extractDocument(kb, id, {
    model: 'test',
    fetchImpl: async () => {
      kb.importContent('test', 'test.md', Buffer.from('# Updated\nDifferent content.'));
      return reply([fact]);
    },
  }), /changed during extraction/);
  assert.equal(kb.document(id).assertions.length, 0);
});

test('a later chunk failure preserves all existing assertions atomically', async (t) => {
  const { kb, id } = await fixture(t);
  kb.importContent('test', 'test.md', Buffer.from(`NPOI 用于 Excel 导出。\n${'extra\n'.repeat(80)}`));
  await extractDocument(kb, id, { model: 'test', fetchImpl: async (_url, options) =>
    reply(JSON.parse(options.body).messages[1].content.includes('NPOI') ? [fact] : []) });
  const original = kb.document(id).assertions[0].id;
  let calls = 0;
  await assert.rejects(() => extractDocument(kb, id, { model: 'test', fetchImpl: async () => {
    if (++calls === 1) return reply([fact]);
    throw new Error('model disconnected');
  } }), /disconnected/);
  assert.equal(kb.document(id).assertions[0].id, original);
});
