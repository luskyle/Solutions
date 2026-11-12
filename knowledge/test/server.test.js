import test from 'node:test';
import assert from 'node:assert/strict';
import { get, createServer } from 'node:http';
import { KnowledgeBase } from '../core.js';
import { startServer } from '../server.js';

async function fixture(t, options = {}) {
  const kb = await KnowledgeBase.open(':memory:');
  const { server, origin } = await startServer(kb, { port: 0, ...options });
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    kb.close();
  });
  const page = await fetch(origin);
  const html = await page.text();
  const token = html.match(/name="knowledge-token" content="([^"]+)"/)[1];
  const api = (route, body, headers = {}) => fetch(`${origin}${route}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'X-Knowledge-Token': token, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { kb, origin, api, html, page };
}

test('local HTTP application serves static assets with restrictive headers', async (t) => {
  const { origin, html, page } = await fixture(t);
  assert.match(html, /知识工作台/);
  assert.ok(!html.includes('__TOKEN__'));
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(page.headers.get('cache-control'), 'no-store');
  for (const name of ['/app.js', '/style.css', '/text.js']) assert.equal((await fetch(`${origin}${name}`)).status, 200);
});

test('API enforces session token, origin and Host checks', async (t) => {
  const { origin, api } = await fixture(t);
  assert.equal((await fetch(`${origin}/api/documents`)).status, 403);
  assert.equal((await api('/api/documents', undefined, { Origin: 'https://evil.example' })).status, 403);
  const invalidHost = await new Promise((resolve, reject) => {
    const request = get(`${origin}/`, { headers: { Host: 'evil.example' } }, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.on('error', reject);
  });
  assert.equal(invalidHost, 403);
  assert.equal((await api('/api/documents', undefined, { 'X-Knowledge-Token': 'bad' })).status, 403);
  assert.equal((await api('/api/documents')).status, 200);
});

test('HTTP import, search, source, graph, update and deletion round-trip', async (t) => {
  const { api } = await fixture(t);
  let response = await api('/api/import', { name: 'example.md', content: '# 示例\n`NPOI` 用于 Excel 导出。' });
  assert.equal(response.status, 200);
  const { id, status } = await response.json();
  assert.equal(status, 'imported');
  const hits = await (await api('/api/search?q=导出')).json();
  assert.equal(hits.length, 1);
  assert.equal(hits[0].document_id, id);
  const doc = await (await api(`/api/document?id=${id}`)).json();
  assert.match(doc.content, /NPOI/);
  assert.equal((await (await api(`/api/graph?document=${id}`)).json()).edges.length, 1);
  response = await api('/api/import', { name: 'example.md', content: '# 更新\n打印机排障' });
  assert.equal((await response.json()).status, 'updated');
  assert.equal((await (await api('/api/search?q=NPOI')).json()).length, 0);
  assert.equal((await api('/api/remove', { id })).status, 200);
  assert.equal((await (await api('/api/documents')).json()).length, 0);
});

test('HTTP errors are explicit, AI is disabled by default, arbitrary paths cannot be imported', async (t) => {
  const { api } = await fixture(t);
  for (const body of [
    { name: '../secret.md', content: 'no' },
    { name: '.private.md', content: 'no' },
    { name: 'scan.pdf', content: 'no' },
    { name: 'empty.md', content: '' },
    { name: 'a.md', content: 3 },
  ]) {
    const response = await api('/api/import', body);
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
  const disabled = await api('/api/extract', { id: 'whatever' });
  assert.equal(disabled.status, 400);
  assert.match((await disabled.json()).error, /disabled/);
  const library = await api('/api/import-library', { path: '/etc' });
  assert.equal(library.status, 400);
  assert.match((await library.json()).error, /No library/);
  assert.equal((await api('/api/unknown')).status, 404);
  assert.equal((await api('/api/review', { id: 'missing', status: 'accepted' })).status, 400);
});

test('real loopback HTTP model protocol integrates extraction, review and graph evidence', async (t) => {
  let requests = 0;
  const model = createServer(async (request, response) => {
    const parts = [];
    for await (const part of request) parts.push(part);
    const body = JSON.parse(Buffer.concat(parts).toString('utf8'));
    requests++;
    assert.equal(request.url, '/api/chat');
    assert.equal(body.model, 'fixture-model');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: { content: JSON.stringify({ assertions: [{
      subject: 'NPOI', predicate: '适用于', object: 'Excel',
      quote: 'NPOI 用于 Excel 导出。', qualifier: '测试样本',
    }] }) } }));
  });
  await new Promise((resolve) => model.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => model.close(resolve)));
  const { api } = await fixture(t, { model: 'fixture-model', endpoint: `http://127.0.0.1:${model.address().port}` });
  const { id } = await (await api('/api/import', { name: 'model.md', content: '# 示例\nNPOI 用于 Excel 导出。' })).json();
  assert.equal(requests, 0);
  const extracted = await api('/api/extract', { id });
  assert.equal(extracted.status, 200);
  assert.equal((await extracted.json()).extracted, 1);
  assert.equal(requests, 1);
  const doc = await (await api(`/api/document?id=${id}`)).json();
  assert.equal(doc.assertions[0].status, 'pending');
  assert.equal((await (await api(`/api/graph?document=${id}`)).json()).edges.length, 0);
  assert.equal((await api('/api/review', { id: doc.assertions[0].id, status: 'accepted' })).status, 200);
  const graph = await (await api(`/api/graph?document=${id}`)).json();
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].quote, 'NPOI 用于 Excel 导出。');
  assert.equal(graph.edges[0].line, 2);
  assert.equal(graph.edges[0].qualifier, '测试样本');
});
