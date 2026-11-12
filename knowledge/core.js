import { createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { constants } from 'node:fs';
import { chmod, lstat, mkdir, open, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { decodeText } from './text.js';

export const MAX_BYTES = 2 * 1024 * 1024;
export const EXTENSIONS = new Set([
  '.md', '.markdown', '.txt', '.cs', '.py', '.js', '.ts', '.jsx', '.tsx',
  '.json', '.xml', '.xsl', '.css', '.html', '.sql', '.rb', '.yml', '.yaml',
]);
const EXCLUDED = new Set(['offline', 'node_modules', 'vendor']);
const HASH = (value) => createHash('sha256').update(value).digest('hex');
const MAX_CHUNK = 12000;

export function allowedName(name) {
  return EXTENSIONS.has(path.extname(name).toLowerCase());
}

export function parseContent(name, bytes, { legacyEncoding } = {}) {
  if (!allowedName(name)) throw new Error(`Unsupported format: ${path.extname(name) || '(none)'}`);
  if (bytes.length > MAX_BYTES) throw new Error('File exceeds the 2 MiB limit');
  const decoded = decodeText(bytes, legacyEncoding);
  const content = decoded.text.replace(/\r\n?/g, '\n');
  if (content.includes('\0')) throw new Error('Binary content is not supported');
  if (!content.trim()) throw new Error('Empty document');
  const lines = content.split('\n');
  if (lines.some((line) => line.length > MAX_CHUNK)) {
    throw new Error('A line exceeds 12,000 characters; split long lines before importing');
  }
  const markdown = ['.md', '.markdown'].includes(path.extname(name).toLowerCase());
  const heading = markdown ? lines.find((line) => /^#\s+\S/.test(line)) : undefined;
  const title = heading ? heading.replace(/^#\s+/, '').trim() : path.basename(name);
  const chunks = [];
  let start = 0;
  while (start < lines.length) {
    let end = start;
    let size = 0;
    while (end < lines.length && end - start < 60 && size + lines[end].length + 1 <= MAX_CHUNK + 1) {
      size += lines[end].length + 1;
      end++;
    }
    const text = lines.slice(start, end).join('\n');
    if (text.trim()) chunks.push({ startLine: start + 1, endLine: end, text });
    start = end;
  }
  return { title: title.slice(0, 300), content, chunks, markdown, encoding: decoded.encoding };
}

function terms(text) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}_]+/gu) || [];
  return words.flatMap((word) => {
    if (!/\p{Script=Han}/u.test(word)) return [word];
    const chars = [...word];
    return chars.length === 1 ? chars : chars.slice(0, -1).map((char, index) => char + chars[index + 1]);
  }).join(' ');
}

function queryTokens(query) {
  const tokens = [...new Set(terms(query).split(' ').filter(Boolean))].slice(0, 32);
  return tokens.map((token) => `"${token.replaceAll('"', '""')}"`).join(' AND ');
}

function mentions(chunk) {
  const result = [];
  let fenced = false;
  for (const [offset, line] of chunk.text.split('\n').entries()) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    for (const match of line.matchAll(/`([^`\n]{2,80})`/g)) {
      const label = match[1].trim();
      if (/^[\p{L}\p{N}_.+#/-]+$/u.test(label) && !/^\d+$/.test(label)) {
        result.push({ label, line: chunk.startLine + offset, quote: match[0] });
      }
    }
  }
  return result.slice(0, 2000);
}

export class KnowledgeBase {
  constructor(db) {
    this.db = db;
    db.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY, source_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
        title TEXT NOT NULL, content TEXT NOT NULL, hash TEXT NOT NULL,
        version INTEGER NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chunks (
        id INTEGER PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        start_line INTEGER NOT NULL, end_line INTEGER NOT NULL, text TEXT NOT NULL
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(terms, tokenize='unicode61');
      CREATE TRIGGER IF NOT EXISTS chunks_delete AFTER DELETE ON chunks BEGIN
        DELETE FROM chunks_fts WHERE rowid = old.id;
      END;
      CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS assertions (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        chunk_id INTEGER NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
        subject TEXT NOT NULL REFERENCES concepts(id),
        predicate TEXT NOT NULL,
        object TEXT NOT NULL REFERENCES concepts(id),
        quote TEXT NOT NULL, start_line INTEGER NOT NULL, end_line INTEGER NOT NULL,
        qualifier TEXT NOT NULL DEFAULT '', method TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected')),
        UNIQUE(document_id, subject, predicate, object, quote, qualifier, method)
      );
      CREATE TABLE IF NOT EXISTS mentions (
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        chunk_id INTEGER NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
        concept_id TEXT NOT NULL REFERENCES concepts(id),
        line INTEGER NOT NULL, quote TEXT NOT NULL,
        UNIQUE(chunk_id, concept_id, line)
      );
      CREATE TABLE IF NOT EXISTS reviews (
        fingerprint TEXT PRIMARY KEY,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected'))
      );
      CREATE INDEX IF NOT EXISTS assertions_document ON assertions(document_id);
      CREATE INDEX IF NOT EXISTS chunks_document ON chunks(document_id);
    `);
  }

  static async open(filename) {
    if (filename === ':memory:') return new KnowledgeBase(new DatabaseSync(filename));
    const directory = path.dirname(path.resolve(filename));
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const handle = await open(filename, constants.O_CREAT | constants.O_RDWR | constants.O_NOFOLLOW, 0o600);
    await handle.close();
    await chmod(filename, 0o600);
    return new KnowledgeBase(new DatabaseSync(filename));
  }

  close() {
    this.db.close();
  }

  transaction(action) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const value = action();
      this.db.exec('COMMIT');
      return value;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  concept(label) {
    const clean = label.normalize('NFC').trim();
    const id = `concept:${HASH(clean)}`;
    this.db.prepare('INSERT OR IGNORE INTO concepts (id, label) VALUES (?, ?)').run(id, clean);
    return id;
  }

  cleanup() {
    this.db.exec(`DELETE FROM concepts WHERE id NOT IN (
      SELECT concept_id FROM mentions UNION SELECT subject FROM assertions UNION SELECT object FROM assertions
    )`);
  }

  importContent(sourceKey, name, bytes, options) {
    const parsed = parseContent(name, bytes, options);
    const hash = HASH(parsed.content);
    const old = this.db.prepare('SELECT * FROM documents WHERE source_key = ?').get(sourceKey);
    if (old?.hash === hash && old.name === name) return { id: old.id, name, status: 'unchanged', encoding: parsed.encoding };
    return this.transaction(() => {
      const id = old?.id || randomUUID();
      this.db.prepare(`INSERT INTO documents (id, source_key, name, title, content, hash, version, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, title=excluded.title,
          content=excluded.content, hash=excluded.hash, version=excluded.version, updated_at=excluded.updated_at`)
        .run(id, sourceKey, name, parsed.title, parsed.content, hash, (old?.version || 0) + 1, new Date().toISOString());
      this.db.prepare('DELETE FROM chunks WHERE document_id = ?').run(id);
      const documentMentions = parsed.markdown ? mentions({ text: parsed.content, startLine: 1 }) : [];
      for (const chunk of parsed.chunks) {
        const inserted = this.db.prepare('INSERT INTO chunks (document_id,start_line,end_line,text) VALUES (?,?,?,?)')
          .run(id, chunk.startLine, chunk.endLine, chunk.text);
        const chunkId = Number(inserted.lastInsertRowid);
        this.db.prepare('INSERT INTO chunks_fts (rowid,terms) VALUES (?,?)')
          .run(chunkId, terms(`${parsed.title}\n${chunk.text}`));
        if (parsed.markdown) {
          for (const mention of documentMentions.filter((item) => item.line >= chunk.startLine && item.line <= chunk.endLine).slice(0, 40)) {
            this.db.prepare(`INSERT OR IGNORE INTO mentions (document_id,chunk_id,concept_id,line,quote)
              VALUES (?,?,?,?,?)`).run(id, chunkId, this.concept(mention.label), mention.line, mention.quote);
          }
        }
      }
      this.cleanup();
      return { id, name, status: old ? 'updated' : 'imported', encoding: parsed.encoding };
    });
  }

  async importDirectory(directory, options = {}) {
    decodeText(new Uint8Array(), options.legacyEncoding);
    const absolute = path.resolve(directory);
    if (absolute.split(path.sep).some((part) => EXCLUDED.has(part) || (part.startsWith('.') && part !== '.'))) {
      throw new Error('Hidden and private directories cannot be imported');
    }
    const info = await lstat(absolute);
    if (!info.isDirectory() || info.isSymbolicLink() || await realpath(absolute) !== absolute) {
      throw new Error('Import root must be a real directory, not a symbolic link');
    }
    const report = { imported: 0, updated: 0, unchanged: 0, decoded: [], skipped: [], failed: [] };
    const walk = async (current) => {
      for (const entry of await readdir(current, { withFileTypes: true })) {
        const filename = path.join(current, entry.name);
        const name = path.relative(absolute, filename).split(path.sep).join('/');
        if (entry.name.startsWith('.') || EXCLUDED.has(entry.name) || entry.isSymbolicLink()) {
          report.skipped.push({ name, reason: 'Excluded, hidden, or symbolic link' });
        } else if (entry.isDirectory()) {
          await walk(filename);
        } else if (!entry.isFile() || !allowedName(entry.name)) {
          report.skipped.push({ name, reason: 'Unsupported format or non-regular file' });
        } else {
          try {
            const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
            let bytes;
            try {
              const stat = await handle.stat();
              if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error('Not a regular file or exceeds 2 MiB');
              bytes = await handle.readFile();
            } finally {
              await handle.close();
            }
            const result = this.importContent(`file:${filename}`, name, bytes, options);
            report[result.status]++;
            if (result.encoding !== 'utf-8') report.decoded.push({ name, encoding: result.encoding });
          } catch (error) {
            report.failed.push({ name, error: error.message });
          }
        }
      }
    };
    await walk(absolute);
    return report;
  }

  list() {
    return this.db.prepare(`SELECT id,name,title,version,updated_at,
      (SELECT count(*) FROM assertions a WHERE a.document_id=d.id AND a.status='pending') AS pending
      FROM documents d ORDER BY updated_at DESC, name`).all();
  }

  document(id) {
    const document = this.db.prepare('SELECT id,name,title,content,version,updated_at FROM documents WHERE id=?').get(id);
    if (!document) throw new Error('Document not found');
    return {
      ...document,
      assertions: this.db.prepare(`SELECT a.*,s.label AS subject_label,o.label AS object_label
        FROM assertions a JOIN concepts s ON s.id=a.subject JOIN concepts o ON o.id=a.object
        WHERE document_id=? ORDER BY start_line,id`).all(id),
      mentions: this.db.prepare(`SELECT m.*,c.label FROM mentions m JOIN concepts c ON c.id=m.concept_id
        WHERE document_id=? ORDER BY line`).all(id),
    };
  }

  chunks(id) {
    return this.db.prepare('SELECT * FROM chunks WHERE document_id=? ORDER BY start_line').all(id);
  }

  search(query, limit = 30) {
    if (typeof query !== 'string' || query.length > 500) throw new Error('Search must be a string of at most 500 characters');
    const expression = queryTokens(query);
    if (!expression) return [];
    return this.db.prepare(`SELECT c.id AS chunk_id,c.document_id,d.name,d.title,c.start_line,c.end_line,
      c.text AS excerpt,bm25(chunks_fts) AS rank
      FROM chunks_fts JOIN chunks c ON c.id=chunks_fts.rowid JOIN documents d ON d.id=c.document_id
      WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?`).all(expression, limit);
  }

  remove(id) {
    return this.transaction(() => {
      const result = this.db.prepare('DELETE FROM documents WHERE id=?').run(id);
      if (!result.changes) throw new Error('Document not found');
      this.cleanup();
      return { removed: id };
    });
  }

  fingerprint(assertion) {
    return HASH(JSON.stringify([
      assertion.document_id, assertion.subject, assertion.predicate, assertion.object,
      assertion.quote, assertion.qualifier, assertion.method,
    ]));
  }

  saveAssertions(documentId, hash, assertions) {
    const doc = this.db.prepare('SELECT hash FROM documents WHERE id=?').get(documentId);
    if (!doc || doc.hash !== hash) throw new Error('Document changed during extraction; retry with the current version');
    return this.transaction(() => {
      this.db.prepare("DELETE FROM assertions WHERE document_id=? AND method='ollama'").run(documentId);
      for (const assertion of assertions) {
        const record = {
          document_id: documentId,
          subject: this.concept(assertion.subject),
          predicate: assertion.predicate,
          object: this.concept(assertion.object),
          quote: assertion.quote,
          qualifier: assertion.qualifier,
          method: 'ollama',
        };
        const fingerprint = this.fingerprint(record);
        const review = this.db.prepare('SELECT status FROM reviews WHERE fingerprint=?').get(fingerprint);
        this.db.prepare(`INSERT OR IGNORE INTO assertions
          (id,document_id,chunk_id,subject,predicate,object,quote,start_line,end_line,qualifier,method,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          randomUUID(), documentId, assertion.chunkId, record.subject, record.predicate, record.object,
          record.quote, assertion.startLine, assertion.endLine, record.qualifier, record.method, review?.status || 'pending',
        );
      }
      this.cleanup();
      return { extracted: assertions.length };
    });
  }

  review(id, status) {
    if (!['pending', 'accepted', 'rejected'].includes(status)) throw new Error('Invalid review status');
    return this.transaction(() => {
      const assertion = this.db.prepare('SELECT * FROM assertions WHERE id=?').get(id);
      if (!assertion) throw new Error('Assertion not found');
      this.db.prepare('INSERT INTO reviews (fingerprint,status) VALUES (?,?) ON CONFLICT(fingerprint) DO UPDATE SET status=excluded.status')
        .run(this.fingerprint(assertion), status);
      this.db.prepare('UPDATE assertions SET status=? WHERE id=?').run(status, id);
      return { id, status };
    });
  }

  graph({ documentId, conceptId, includePending = false } = {}) {
    if (!documentId && !conceptId) return { nodes: [], edges: [], message: 'Select a document or concept to explore its local graph' };
    if (documentId) this.document(documentId);
    const nodes = new Map();
    const edges = [];
    const addConcept = (id, label) => nodes.set(id, { id, label, type: 'concept' });
    const addDocument = (id, title) => nodes.set(id, { id, label: title, type: 'document' });
    const mentioned = this.db.prepare(`SELECT m.document_id,m.concept_id,min(m.line) AS line,
      c.label,d.title FROM mentions m JOIN concepts c ON c.id=m.concept_id
      JOIN documents d ON d.id=m.document_id WHERE ${documentId ? 'm.document_id=?' : 'm.concept_id=?'}
      GROUP BY m.document_id,m.concept_id LIMIT 80`).all(documentId || conceptId);
    if (documentId) {
      const doc = this.document(documentId);
      addDocument(doc.id, doc.title);
    }
    for (const item of mentioned) {
      addDocument(item.document_id, item.title);
      addConcept(item.concept_id, item.label);
      edges.push({ source: item.document_id, target: item.concept_id, label: '提及',
        documentId: item.document_id, line: item.line, method: 'structural', status: 'observed' });
    }
    const facts = this.db.prepare(`SELECT a.*,s.label AS subject_label,o.label AS object_label
      FROM assertions a JOIN concepts s ON s.id=a.subject JOIN concepts o ON o.id=a.object
      WHERE ${documentId ? 'a.document_id=?' : '(a.subject=? OR a.object=?)'}
      AND a.status ${includePending ? "IN ('accepted','pending')" : "='accepted'"}
      ORDER BY a.start_line LIMIT 80`).all(...(documentId ? [documentId] : [conceptId, conceptId]));
    for (const fact of facts) {
      addConcept(fact.subject, fact.subject_label);
      addConcept(fact.object, fact.object_label);
      edges.push({ id: fact.id, source: fact.subject, target: fact.object, label: fact.predicate,
        documentId: fact.document_id, line: fact.start_line, quote: fact.quote,
        qualifier: fact.qualifier, method: fact.method, status: fact.status });
    }
    return { nodes: [...nodes.values()], edges, limit: 80 };
  }
}
