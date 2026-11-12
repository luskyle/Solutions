import * as vscode from 'vscode';
import path from 'node:path';
import { WorkspaceKnowledge } from './workspace.ts';
import { GitHistory } from './history.ts';
import { escape, page, overview, sourceContent, searchContent, historyContent } from './render.ts';
import type { ParsedSource } from './types.js';

interface TreeNode {
  relativePath: string;
  directory: boolean;
}

interface Message {
  type: string;
  path?: string;
  query?: string;
  block?: string;
  commit?: string;
  id?: string;
}

function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null || !('type' in value) || typeof value.type !== 'string') return false;
  for (const key of ['path', 'query', 'block', 'commit', 'id']) {
    if (key in value && typeof Reflect.get(value, key) !== 'string') return false;
  }
  return true;
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel('知识处理');
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 30);
  status.command = 'knowledge.overview';
  status.text = '$(library) 知识工作区';
  status.show();
  const changed = new vscode.EventEmitter<TreeNode | undefined>();
  const panels = new Set<vscode.WebviewPanel>();
  const keyedPanels = new Map<string, vscode.WebviewPanel>();
  const panelContents = new WeakMap<vscode.WebviewPanel, string>();
  const pendingFocus = new WeakMap<vscode.Webview, string>();
  let engine: WorkspaceKnowledge | undefined;
  let history: GitHistory | undefined;
  let currentScope = '';
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let activeTasks = 0;
  let scanPromise: Promise<void> | undefined;
  const ready = (): WorkspaceKnowledge => {
    if (!vscode.workspace.isTrusted) throw new Error('请先信任工作区，再读取资料与 Git 历史');
    if (!engine) throw new Error('请先打开一个本机文件夹');
    return engine;
  };
  const git = (): GitHistory => {
    ready();
    if (!history) throw new Error('Git 服务尚未初始化');
    return history;
  };
  const run = async (action: () => Promise<void>): Promise<void> => {
    activeTasks++;
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      output.appendLine(message);
      await vscode.window.showErrorMessage(`知识工作台：${message}`);
    } finally {
      activeTasks--;
    }
  };
  const tree: vscode.TreeDataProvider<TreeNode> = {
    onDidChangeTreeData: changed.event,
    getTreeItem(node) {
      const record = engine?.records.get(node.relativePath);
      const item = new vscode.TreeItem(node.relativePath ? path.posix.basename(node.relativePath) : path.basename(engine?.root || '工作区'),
        node.directory ? (node.relativePath ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded) : vscode.TreeItemCollapsibleState.None);
      item.resourceUri = engine ? vscode.Uri.file(path.join(engine.root, node.relativePath)) : undefined;
      item.contextValue = node.directory ? 'collection' : 'source';
      item.description = node.directory ? undefined : record?.status === 'failed' ? '解析失败' : record?.status === 'unsupported' ? '未支持' : record?.parsed?.kind;
      item.tooltip = record?.error || node.relativePath || engine?.root;
      item.iconPath = new vscode.ThemeIcon(node.directory ? 'folder' : record?.status === 'failed' ? 'warning' : 'file');
      item.command = { command: node.directory ? 'knowledge.overview' : 'knowledge.read',
        title: node.directory ? '集合概览' : '阅读来源', arguments: [node] };
      return item;
    },
    getChildren(node) {
      if (!engine) return [];
      if (!node) return [{ relativePath: '', directory: true }];
      if (!node.directory) return [];
      const parent = (value: string) => path.posix.dirname(value) === '.' ? '' : path.posix.dirname(value);
      return [
        ...[...engine.directories].filter(value => value && parent(value) === node.relativePath).map(relativePath => ({ relativePath, directory: true })),
        ...[...engine.records.keys()].filter(value => parent(value) === node.relativePath).map(relativePath => ({ relativePath, directory: false })),
      ];
    },
  };

  const relative = (value?: TreeNode | vscode.Uri | string): string => {
    const workspace = ready();
    if (typeof value === 'string') return value;
    if (value instanceof vscode.Uri) {
      const rel = path.relative(workspace.root, value.fsPath).split(path.sep).join('/');
      if (rel && !workspace.contains(rel)) throw new Error('选择不在当前允许的工作区范围内');
      return rel;
    }
    return value?.relativePath ?? currentScope;
  };

  const configureWebview = (webview: vscode.Webview): void => {
    webview.options = { enableScripts: true, localResourceRoots: engine ? [vscode.Uri.file(engine.root)] : [] };
  };

  const createPanel = (title: string, key?: string): vscode.WebviewPanel => {
    const existing = key ? keyedPanels.get(key) : undefined;
    if (existing) { existing.reveal(); return existing; }
    const panel = vscode.window.createWebviewPanel('knowledge.page', title, vscode.ViewColumn.Active, {
      enableScripts: true, retainContextWhenHidden: true, localResourceRoots: engine ? [vscode.Uri.file(engine.root)] : [],
    });
    panels.add(panel);
    if (key) keyedPanels.set(key, panel);
    const subscription = bind(panel.webview);
    panel.onDidDispose(() => {
      panels.delete(panel);
      if (key) keyedPanels.delete(key);
      subscription.dispose();
    });
    return panel;
  };

  const display = (panel: vscode.WebviewPanel, title: string, content: string, scope: string): void => {
    const signature = JSON.stringify([title, content, scope]);
    if (panelContents.get(panel) !== signature) {
      panel.webview.html = page(panel.webview, title, content, scope);
      panelContents.set(panel, signature);
    }
    panel.reveal();
    void panel.webview.postMessage({ type: 'current' });
  };

  const showOverview = async (scope = currentScope): Promise<void> => {
    const workspace = ready();
    await workspace.safePath(scope);
    if (!workspace.directories.has(scope)) throw new Error('所选项不是集合目录');
    currentScope = scope;
    const panel = createPanel(scope ? path.posix.basename(scope) : '工作区概览', `collection:${scope}`);
    const children = [...workspace.directories].filter(value => value && (path.posix.dirname(value) === '.' ? '' : path.posix.dirname(value)) === scope);
    display(panel, scope ? path.posix.basename(scope) : path.basename(workspace.root),
      overview(scope, workspace.sources(scope), children, workspace.report), scope);
  };

  const readSource = async (relativePath: string, block?: string): Promise<void> => {
    const workspace = ready();
    const parsed = await workspace.read(relativePath);
    const panel = createPanel(parsed.title, `source:${relativePath}`);
    if (block) pendingFocus.set(panel.webview, block);
    display(panel, parsed.title, sourceContent(parsed, relativePath,
      parsed.kind === 'image' ? panel.webview.asWebviewUri(vscode.Uri.file(await workspace.safePath(relativePath))) : undefined),
    path.posix.dirname(relativePath) === '.' ? '' : path.posix.dirname(relativePath));
    if (block) await panel.webview.postMessage({ type: 'focus', id: block });
  };

  const showHistory = async (relativePath: string): Promise<void> => {
    const workspace = ready();
    const data = await git().list(relativePath);
    const panel = createPanel(`演变 · ${path.posix.basename(relativePath) || '工作区'}`, `history:${relativePath}`);
    display(panel, 'Git 演变', historyContent(relativePath, data, workspace.directories.has(relativePath)), currentScope);
  };

  const sourceText = (parsed: ParsedSource): string => parsed.blocks.map(block => `[${block.label}]\n${block.text}`).join('\n\n');
  const versionProvider: vscode.TextDocumentContentProvider = {
    async provideTextDocumentContent(uri) {
      const parameters = new URLSearchParams(uri.query);
      const source = parameters.get('path');
      if (!source) throw new Error('缺少版本来源路径');
      const commit = parameters.get('commit');
      return sourceText(commit ? await git().snapshot(source, commit) : await ready().read(source));
    },
  };

  function bind(webview: vscode.Webview): vscode.Disposable {
    return webview.onDidReceiveMessage((value: unknown) => run(async () => {
      if (!isMessage(value)) throw new Error('无效的工作台消息');
      const scope = value.path ?? currentScope;
      switch (value.type) {
        case 'loaded': {
          const block = pendingFocus.get(webview);
          if (block) {
            await webview.postMessage({ type: 'focus', id: block });
            pendingFocus.delete(webview);
          }
          break;
        }
        case 'overview': await showOverview(scope); break;
        case 'read': await readSource(scope, value.block); break;
        case 'history': await showHistory(scope); break;
        case 'refresh': await refresh(); await showOverview(); break;
        case 'focusBlock': await webview.postMessage({ type: 'focus', id: value.id }); break;
        case 'external':
          await vscode.env.openExternal(vscode.Uri.file(await ready().safePath(scope)));
          break;
        case 'search': {
          const query = value.query?.trim();
          if (!query) throw new Error('请输入查询内容');
          await ready().safePath(scope);
          const panel = createPanel(`搜索 · ${query}`);
          display(panel, '集合内搜索', searchContent(query, ready().search(query, scope)), scope);
          break;
        }
        case 'snapshot': {
          if (!value.commit) throw new Error('缺少提交标识');
          const parsed = await git().snapshot(scope, value.commit);
          const panel = createPanel(`${parsed.title} · ${value.commit.slice(0, 8)}`);
          display(panel, parsed.title,
            `<p class="notice">历史版本：${escape(value.commit)}，不是当前工作区。</p>${sourceContent(parsed, scope, undefined, `提交 ${value.commit}`)}`, currentScope);
          break;
        }
        case 'compare': {
          if (!value.commit) throw new Error('缺少提交标识');
          const make = (commit?: string) => vscode.Uri.from({ scheme: 'knowledge-version', path: `/${scope}.txt`,
            query: new URLSearchParams({ path: scope, ...(commit ? { commit } : { working: String(Date.now()) }) }).toString() });
          await vscode.commands.executeCommand('vscode.diff', make(value.commit), make(),
            `${scope} · ${value.commit.slice(0, 8)} ↔ 当前工作区快照`);
          break;
        }
        case 'diff': {
          if (!value.commit) throw new Error('缺少提交标识');
          const doc = await vscode.workspace.openTextDocument({ content: await git().diff(scope, value.commit), language: 'diff' });
          await vscode.window.showTextDocument(doc);
          break;
        }
        default: throw new Error('不支持的工作台操作');
      }
    }));
  }

  const refresh = async (): Promise<void> => {
    if (scanPromise) return scanPromise;
    const workspace = ready();
    scanPromise = (async () => {
      status.text = '$(sync~spin) 正在索引知识';
      const report = await workspace.scan();
      if (disposed || workspace !== engine) return;
      status.text = `$(library) ${report.ready} 来源 · ${report.failed} 失败`;
      status.tooltip = `${report.unsupported} 个未支持格式，${report.skipped} 个排除条目${report.truncated ? '；达到扫描上限' : ''}`;
      output.appendLine(JSON.stringify(report));
      for (const record of workspace.records.values()) {
        if (record.error) output.appendLine(`${record.relativePath}: ${record.error}`);
      }
      changed.fire(undefined);
    })();
    try {
      await scanPromise;
    } finally {
      scanPromise = undefined;
    }
  };

  const initialize = async (): Promise<void> => {
    if (scanPromise) await scanPromise;
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder || folder.uri.scheme !== 'file') {
      engine = undefined;
      history = undefined;
      currentScope = '';
      status.text = '$(library) 打开本机知识目录';
      changed.fire(undefined);
      return;
    }
    if ((vscode.workspace.workspaceFolders?.length || 0) > 1) {
      await vscode.window.showWarningMessage('当前知识工具仅索引第一个工作区根目录，其他根目录未纳入知识搜索。');
    }
    const configuration = vscode.workspace.getConfiguration('knowledge');
    engine = new WorkspaceKnowledge(folder.uri.fsPath, configuration.get<string[]>('excludeDirectories') || [],
      configuration.get<string>('legacyEncoding') === 'gb18030');
    history = new GitHistory(engine);
    currentScope = '';
    await refresh();
  };

  const register = (name: string, action: (value?: TreeNode | vscode.Uri | string) => Promise<void>): void => {
    context.subscriptions.push(vscode.commands.registerCommand(name, value => run(() => action(value))));
  };
  context.subscriptions.push(output, status, changed,
    vscode.window.registerTreeDataProvider('knowledge.collections', tree),
    vscode.workspace.registerTextDocumentContentProvider('knowledge-version', versionProvider));
  register('knowledge.openFolder', async () => {
    const picked = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: '打开知识目录' });
    if (picked?.[0]) await vscode.commands.executeCommand('vscode.openFolder', picked[0], false);
  });
  register('knowledge.overview', async value => showOverview(relative(value)));
  register('knowledge.read', async value => readSource(relative(value)));
  register('knowledge.history', async value => showHistory(relative(value)));
  register('knowledge.refresh', async () => { await refresh(); await showOverview(); });
  register('knowledge.search', async value => {
    const scope = relative(value);
    const query = await vscode.window.showInputBox({ prompt: `搜索范围：${scope || '工作区根集合'}`, placeHolder: '输入关键词；空格分隔的词均需匹配' });
    if (!query?.trim()) return;
    const panel = createPanel(`搜索 · ${query}`);
    display(panel, '集合内搜索', searchContent(query, ready().search(query, scope)), scope);
  });
  const provider: vscode.CustomReadonlyEditorProvider<vscode.CustomDocument> = {
    async openCustomDocument(uri) { return { uri, dispose() {} }; },
    async resolveCustomEditor(document, panel) {
      configureWebview(panel.webview);
      panels.add(panel);
      const subscription = bind(panel.webview);
      panel.onDidDispose(() => { panels.delete(panel); subscription.dispose(); });
      await run(async () => {
        const source = relative(document.uri);
        const parsed = await ready().read(source);
        panel.webview.html = page(panel.webview, parsed.title, sourceContent(parsed, source), currentScope);
      });
    },
  };
  context.subscriptions.push(vscode.window.registerCustomEditorProvider('knowledge.reader', provider));
  const watcher = vscode.workspace.createFileSystemWatcher('**/*');
  const onChange = (uri: vscode.Uri): void => {
    if (!engine) return;
    const source = path.relative(engine.root, uri.fsPath).split(path.sep).join('/');
    if (!engine.contains(source)) return;
    const record = engine.records.get(source);
    if (record) { record.mtime = -1; record.status = 'pending'; }
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      void run(async () => {
        await refresh();
        for (const panel of panels) {
          await panel.webview.postMessage({ type: 'sourceChanged' });
        }
      });
    }, 750);
  };
  context.subscriptions.push(watcher, watcher.onDidCreate(onChange), watcher.onDidChange(onChange), watcher.onDidDelete(onChange),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('knowledge')) void run(initialize);
    }),
    vscode.workspace.onDidGrantWorkspaceTrust(() => run(initialize)),
    vscode.workspace.onDidChangeWorkspaceFolders(() => run(async () => {
      for (const panel of panels) panel.dispose();
      await initialize();
      if (engine) await showOverview('');
    })),
    { dispose() {
      disposed = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      for (const panel of panels) panel.dispose();
    } });
  if (vscode.workspace.isTrusted) await run(initialize);
  await vscode.commands.executeCommand('workbench.view.extension.knowledge');
  if (engine) await run(() => showOverview(''));
  output.appendLine(`Knowledge Workbench activated; ${activeTasks} pending tasks.`);
}
