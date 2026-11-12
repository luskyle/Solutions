import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { realpath } from 'node:fs/promises';
import { MAX_SOURCE_BYTES, parseSource } from './parsers.ts';
import type { ParsedSource } from './types.js';
import type { WorkspaceKnowledge } from './workspace.js';

const execute = promisify(execFile);
const HASH = /^[a-f0-9]{40,64}$/;

export interface HistoryEntry {
  commit: string;
  date: string;
  subject: string;
}

interface GitContext {
  root: string;
  relativePath: string;
}

export class GitHistory {
  private readonly workspace: WorkspaceKnowledge;
  private readonly environment: NodeJS.ProcessEnv;

  constructor(workspace: WorkspaceKnowledge, environment: NodeJS.ProcessEnv = process.env) {
    this.workspace = workspace;
    this.environment = Object.fromEntries(Object.entries(environment).filter(([key]) =>
      !/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+|PARAMETERS)$/.test(key)
      && !['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'].includes(key)));
  }

  private async git(root: string, args: string[], maxBuffer = 2 * 1024 * 1024): Promise<Buffer> {
    const result = await execute('git', ['--no-pager', '-c', 'core.quotePath=false',
      '-c', 'core.fsmonitor=false', '-c', 'core.pager=cat', ...args], {
      cwd: root, encoding: 'buffer', maxBuffer, timeout: 20000,
      env: { ...this.environment, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_CONFIG_NOSYSTEM: '1' },
    });
    return result.stdout;
  }

  private async context(relativePath: string): Promise<GitContext> {
    await this.workspace.safePath(relativePath);
    const absolute = path.resolve(this.workspace.root, relativePath);
    const directory = this.workspace.directories.has(relativePath) ? absolute : path.dirname(absolute);
    const root = (await this.git(directory, ['rev-parse', '--show-toplevel'])).toString('utf8').trim();
    return { root: await realpath(root), relativePath: path.relative(root, absolute).split(path.sep).join('/') || '.' };
  }

  async list(relativePath = ''): Promise<{ entries: HistoryEntry[]; branch: string; dirty: boolean }> {
    const context = await this.context(relativePath);
    const raw = await this.git(context.root, [
      'log', '--first-parent', '-n', '60', '--format=%H%x00%cI%x00%s%x00', '--', context.relativePath,
    ]);
    const parts = raw.toString('utf8').split('\0');
    const entries: HistoryEntry[] = [];
    for (let index = 0; index + 2 < parts.length; index += 3) {
      const commit = parts[index]?.trim() || '';
      if (HASH.test(commit)) entries.push({ commit, date: parts[index + 1] || '', subject: parts[index + 2] || '' });
    }
    const branch = (await this.git(context.root, ['rev-parse', '--abbrev-ref', 'HEAD'])).toString('utf8').trim();
    const dirty = Boolean((await this.git(context.root, ['status', '--porcelain', '--untracked-files=normal', '--', context.relativePath])).length);
    return { entries, branch, dirty };
  }

  async snapshot(relativePath: string, commit: string): Promise<ParsedSource> {
    if (!HASH.test(commit)) throw new Error('必须使用完整提交哈希');
    const context = await this.context(relativePath);
    const object = (await this.git(context.root, ['rev-parse', '--verify', `${commit}:${context.relativePath}`])).toString('utf8').trim();
    if (!HASH.test(object)) throw new Error('无法定位历史文件对象');
    const size = Number((await this.git(context.root, ['cat-file', '-s', object])).toString('utf8'));
    if (!Number.isFinite(size) || size > MAX_SOURCE_BYTES) throw new Error('历史文件超过 16 MiB 上限');
    const bytes = await this.git(context.root, ['cat-file', 'blob', object], MAX_SOURCE_BYTES + 1024);
    if (bytes.subarray(0, 100).toString('utf8').startsWith('version https://git-lfs.github.com/spec/')) {
      throw new Error('此版本是 Git LFS 指针；不会自动联网下载历史内容');
    }
    const parsed = parseSource(relativePath, bytes, this.workspace.legacy);
    if (parsed.kind === 'image') throw new Error('此版本暂不提供历史图片预览；可在 Git 中查看原始对象');
    return parsed;
  }

  async diff(relativePath: string, commit: string): Promise<string> {
    if (!HASH.test(commit)) throw new Error('必须使用完整提交哈希');
    const context = await this.context(relativePath);
    return (await this.git(context.root, [
      'diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--stat', '--patch', '--no-color', commit, '--', context.relativePath,
    ], 4 * 1024 * 1024)).toString('utf8');
  }
}
