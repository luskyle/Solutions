import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { parseSource, supported, MAX_SOURCE_BYTES } from './parsers.ts';
import type { ParsedSource, SearchHit, SourceRecord } from './types.js';

export interface ScanReport {
  ready: number;
  failed: number;
  unsupported: number;
  skipped: number;
  truncated: boolean;
}

export class WorkspaceKnowledge {
  readonly root: string;
  readonly records = new Map<string, SourceRecord>();
  readonly directories = new Set<string>(['']);
  readonly excluded: Set<string>;
  readonly legacy: boolean;
  report: ScanReport = { ready: 0, failed: 0, unsupported: 0, skipped: 0, truncated: false };
  private scanning?: Promise<ScanReport>;

  constructor(root: string, excluded: string[], legacy = false) {
    this.root = path.resolve(root);
    this.excluded = new Set(excluded.concat(['.git']));
    this.legacy = legacy;
  }

  contains(relativePath: string): boolean {
    if (path.isAbsolute(relativePath)) return false;
    const normalized = relativePath.replaceAll('\\', '/');
    return !normalized.split('/').some(part => part === '..' || part.startsWith('.') || this.excluded.has(part));
  }

  async safePath(relativePath: string): Promise<string> {
    if (relativePath !== '' && !this.contains(relativePath)) throw new Error('来源不在允许的工作区范围内');
    const absolute = path.resolve(this.root, relativePath);
    const canonical = await realpath(absolute);
    const root = await realpath(this.root);
    const relative = path.relative(root, canonical);
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) throw new Error('不跟随工作区外部的符号链接');
    if (canonical !== absolute && absolute !== this.root) throw new Error('不解析符号链接来源');
    return absolute;
  }

  async read(relativePath: string): Promise<ParsedSource> {
    const absolute = await this.safePath(relativePath);
    const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > MAX_SOURCE_BYTES) throw new Error('非普通文件或超过 16 MiB 上限');
      return parseSource(relativePath, await handle.readFile(), this.legacy);
    } finally {
      await handle.close();
    }
  }

  async scan(): Promise<ScanReport> {
    if (this.scanning) return this.scanning;
    this.scanning = this.performScan();
    try {
      return await this.scanning;
    } finally {
      this.scanning = undefined;
    }
  }

  private async performScan(): Promise<ScanReport> {
    const report: ScanReport = { ready: 0, failed: 0, unsupported: 0, skipped: 0, truncated: false };
    const seen = new Set<string>();
    this.directories.clear();
    this.directories.add('');
    let visited = 0;
    const walk = async (directory: string): Promise<void> => {
      const entries = await readdir(await this.safePath(directory), { withFileTypes: true });
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'zh'))) {
        if (++visited > 10000 || seen.size >= 5000) {
          report.truncated = true;
          return;
        }
        const relative = path.posix.join(directory, entry.name);
        if (!this.contains(relative) || entry.isSymbolicLink()) {
          report.skipped++;
          continue;
        }
        if (entry.isDirectory()) {
          this.directories.add(relative);
          await walk(relative);
          if (report.truncated) return;
        } else if (entry.isFile()) {
          seen.add(relative);
          const previous = this.records.get(relative);
          try {
            const stat = await lstat(path.join(this.root, relative));
            const record: SourceRecord = {
              relativePath: relative, size: stat.size, mtime: stat.mtimeMs,
              status: supported(relative) ? 'pending' : 'unsupported',
            };
            if (record.status === 'unsupported') report.unsupported++;
            else {
              record.parsed = previous?.status === 'ready' && previous.mtime === record.mtime && previous.size === record.size
                ? previous.parsed : await this.read(relative);
              record.status = 'ready';
              report.ready++;
            }
            this.records.set(relative, record);
          } catch (error) {
            this.records.set(relative, { relativePath: relative, size: 0, mtime: 0,
              status: 'failed', error: error instanceof Error ? error.message : String(error) });
            report.failed++;
          }
        }
      }
    };
    await walk('');
    for (const key of this.records.keys()) if (!seen.has(key)) this.records.delete(key);
    this.report = report;
    return report;
  }

  inScope(relativePath: string, scope: string): boolean {
    return scope === '' || relativePath === scope || relativePath.startsWith(`${scope}/`);
  }

  sources(scope = ''): SourceRecord[] {
    return [...this.records.values()].filter(record => this.inScope(record.relativePath, scope))
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'zh'));
  }

  search(query: string, scope = ''): SearchHit[] {
    if (query.length > 300) throw new Error('查询最长 300 个字符');
    const tokens = query.normalize('NFC').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const hits: SearchHit[] = [];
    for (const record of this.sources(scope)) {
      if (!record.parsed) continue;
      for (const block of record.parsed.blocks) {
        const content = `${record.relativePath}\n${block.text}`.normalize('NFC').toLowerCase();
        if (tokens.every(token => content.includes(token))) {
          hits.push({ relativePath: record.relativePath, title: record.parsed.title, block });
          if (hits.length >= 100) return hits;
        }
      }
    }
    return hits;
  }
}
