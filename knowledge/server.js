import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MAX_BYTES } from './core.js';
import { extractDocument } from './model.js';

const WEB = new URL('./web/', import.meta.url);
const MAX_BODY = 12 * 1024 * 1024;
const STATIC = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/text.js', ['../text.js', 'text/javascript; charset=utf-8']],
]);

async function bodyJSON(request) {
  if (request.headers['content-type'] !== 'application/json') throw new Error('Expected application/json');
  const parts = [];
  let size = 0;
  for await (const part of request) {
    size += part.length;
    if (size > MAX_BODY) throw new Error('Request body exceeds 12 MiB');
    parts.push(part);
  }
  const body = JSON.parse(Buffer.concat(parts).toString('utf8'));
  if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('Expected a JSON object');
  return body;
}

function validToken(value, expected) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

function stringField(body, name, maxLength = 200) {
  const value = body[name];
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new Error(`Invalid field: ${name}`);
  }
  return value;
}

export async function startServer(kb, { port = 4317, importRoot, model, endpoint } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 to 65535');
  const token = randomBytes(32).toString('hex');
  let origin;
  let extracting = false;
  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    const json = (value, status = 200) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(value));
    };
    try {
      if (request.headers.host !== new URL(origin).host) {
        json({ error: 'Invalid Host header; use the printed 127.0.0.1 address' }, 403);
        return;
      }
      if (request.headers.origin && request.headers.origin !== origin) {
        json({ error: 'Cross-origin access is not allowed' }, 403);
        return;
      }
      const url = new URL(request.url, origin);
      if (request.method === 'GET' && STATIC.has(url.pathname)) {
        const [filename, mime] = STATIC.get(url.pathname);
        const bytes = await readFile(fileURLToPath(new URL(filename, WEB)));
        response.writeHead(200, { 'Content-Type': mime });
        response.end(filename === 'index.html' ? bytes.toString('utf8').replace('__TOKEN__', token) : bytes);
        return;
      }
      if (!validToken(request.headers['x-knowledge-token'], token)) {
        json({ error: 'Missing or invalid session token; reload the local application' }, 403);
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/status') {
        json({ documents: kb.list().length, importRoot: importRoot || null, model: model || null, extracting });
      } else if (request.method === 'GET' && url.pathname === '/api/documents') {
        json(kb.list());
      } else if (request.method === 'GET' && url.pathname === '/api/document') {
        json(kb.document(url.searchParams.get('id')));
      } else if (request.method === 'GET' && url.pathname === '/api/search') {
        json(kb.search(url.searchParams.get('q') || ''));
      } else if (request.method === 'GET' && url.pathname === '/api/graph') {
        json(kb.graph({
          documentId: url.searchParams.get('document') || undefined,
          conceptId: url.searchParams.get('concept') || undefined,
          includePending: url.searchParams.get('pending') === 'true',
        }));
      } else if (request.method === 'POST' && url.pathname === '/api/import') {
        const body = await bodyJSON(request);
        const name = stringField(body, 'name');
        if (/[\\/\x00-\x1f]/.test(name) || name.startsWith('.')) throw new Error('Upload a visible filename without directory components');
        const content = stringField(body, 'content', MAX_BYTES);
        json(kb.importContent(`upload:${name}`, name, Buffer.from(content, 'utf8')));
      } else if (request.method === 'POST' && url.pathname === '/api/import-library') {
        const body = await bodyJSON(request);
        if (!importRoot) throw new Error('No library import root configured');
        json(await kb.importDirectory(importRoot, { legacyEncoding: body.legacyEncoding }));
      } else if (request.method === 'POST' && url.pathname === '/api/remove') {
        const body = await bodyJSON(request);
        json(kb.remove(stringField(body, 'id')));
      } else if (request.method === 'POST' && url.pathname === '/api/review') {
        const body = await bodyJSON(request);
        json(kb.review(stringField(body, 'id'), stringField(body, 'status')));
      } else if (request.method === 'POST' && url.pathname === '/api/extract') {
        const body = await bodyJSON(request);
        if (!model) throw new Error('AI is disabled; restart with an explicitly configured local Ollama model');
        if (extracting) throw new Error('An extraction is already running');
        extracting = true;
        try {
          json(await extractDocument(kb, stringField(body, 'id'), { model, endpoint }));
        } finally {
          extracting = false;
        }
      } else {
        json({ error: 'Route not found' }, 404);
      }
    } catch (error) {
      console.error(`[knowledge] ${request.method} ${request.url}: ${error.message}`);
      if (!response.headersSent && !response.destroyed) json({ error: error.message }, 400);
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  return { server, origin };
}
