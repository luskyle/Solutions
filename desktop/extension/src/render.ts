import { randomBytes } from 'node:crypto';
import type { Webview, Uri } from 'vscode';
import type { ParsedSource, SourceRecord, SearchHit } from './types.js';
import type { ScanReport } from './workspace.js';
import type { HistoryEntry } from './history.js';

export function escape(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

function button(label: string, action: string, fields: Record<string, string> = {}): string {
  const attributes = Object.entries(fields).map(([key, value]) => `data-${key}="${escape(value)}"`).join(' ');
  return `<button data-action="${action}" ${attributes}>${escape(label)}</button>`;
}

export function page(webview: Webview, title: string, content: string, scope: string): string {
  const nonce = randomBytes(18).toString('base64');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<title>${escape(title)}</title>
<style nonce="${nonce}">
body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);margin:0;padding:24px 32px;line-height:1.6}
header{border-bottom:1px solid var(--vscode-panel-border);padding-bottom:18px;margin-bottom:22px}
h1{font-size:26px;margin:6px 0}h2{font-size:18px;margin:24px 0 12px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--vscode-descriptionForeground)}
.muted{color:var(--vscode-descriptionForeground);font-size:12px}.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
button{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);border:1px solid transparent;padding:6px 12px;cursor:pointer;font:inherit;font-size:12px}
button:hover{background:var(--vscode-button-secondaryHoverBackground)}button:focus-visible,input:focus-visible{outline:2px solid var(--vscode-focusBorder);outline-offset:2px}
input{background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:8px 10px;min-width:220px;flex:1}
.card{border:1px solid var(--vscode-panel-border);border-radius:5px;margin:10px 0;padding:16px;overflow-wrap:anywhere}
.card h3{margin:0 0 8px;font-size:15px}.badge{background:var(--vscode-badge-background);color:var(--vscode-badge-foreground);padding:2px 7px;font-size:11px;border-radius:10px}
.error{color:var(--vscode-errorForeground)}pre{font:13px/1.7 var(--vscode-editor-font-family);white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0}
.notice{border-left:3px solid var(--vscode-focusBorder);padding:8px 14px;background:var(--vscode-textBlockQuote-background)}
.evidence:target,.evidence.focused{outline:2px solid var(--vscode-focusBorder);outline-offset:2px}
img.source-image{max-width:100%;max-height:75vh;object-fit:contain}
svg.diagram{width:100%;max-height:700px;border:1px solid var(--vscode-panel-border);background:var(--vscode-editor-background)}
.diagram rect{fill:var(--vscode-button-secondaryBackground);stroke:var(--vscode-descriptionForeground)}
.diagram line{stroke:var(--vscode-descriptionForeground);stroke-width:2}.diagram text{fill:var(--vscode-foreground);font:12px sans-serif;text-anchor:middle}
.diagram .node{cursor:pointer}.diagram .edge-label{font-size:11px}
.history-entry{display:grid;grid-template-columns:1fr auto;gap:10px}.path{font:12px var(--vscode-editor-font-family)}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{text-align:left;padding:9px;border-bottom:1px solid var(--vscode-panel-border)}
@media(max-width:600px){body{padding:16px}.history-entry{grid-template-columns:1fr}input{min-width:120px}}
</style></head><body>
<header><div class="eyebrow">KNOWLEDGE WORKBENCH / ${escape(scope || '工作区根集合')}</div><h1>${escape(title)}</h1>
<div class="row">${button('集合概览', 'overview', { path: scope })}${button('Git 演变', 'history', { path: scope })}${button('重新索引', 'refresh')}</div></header>
${content}
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
document.addEventListener('click', event => {
  const target=event.target.closest('[data-action]');
  if(!target) return;
  const {action,...fields}=target.dataset;
  vscode.postMessage({type:action,...fields});
});
document.querySelector('#search-form')?.addEventListener('submit', event => {
  event.preventDefault();
  vscode.postMessage({type:'search',query:document.querySelector('#query').value,path:${JSON.stringify(scope).replaceAll('<', '\\u003c')}});
});
window.addEventListener('message', event => {
  if(event.data?.type==='current') document.querySelector('#stale-notice')?.remove();
  if(event.data?.type==='sourceChanged' && !document.querySelector('#stale-notice')){
    const notice=document.createElement('p');notice.id='stale-notice';notice.className='notice';
    notice.textContent='工作区来源已变化，此页可能过时。请重新打开来源或集合以查看最新内容。';
    document.body.prepend(notice);
  }
  if(event.data?.type==='focus' && typeof event.data.id==='string'){
    const node=document.getElementById(event.data.id);
    if(node){document.querySelectorAll('.focused').forEach(item=>item.classList.remove('focused'));node.classList.add('focused');node.scrollIntoView({block:'center'});}
  }
});
vscode.postMessage({type:'loaded'});
document.querySelector('.source-image')?.addEventListener('error', event => {
  const notice=document.createElement('p');notice.className='error';notice.textContent='图片无法解码，请使用原生应用检查文件。';
  event.target.replaceWith(notice);
});
</script></body></html>`;
}

export function overview(scope: string, sources: SourceRecord[], directories: string[], report: ScanReport): string {
  const count = (status: SourceRecord['status']) => sources.filter(item => item.status === status).length;
  return `<p class="notice">文件夹是集合，文件是来源。此页是确定性的目录与处理概览，不是 AI 生成的知识总结；原始文件没有被移动或上传。</p>
<div class="row"><span class="badge">${sources.length} 份来源</span><span class="badge">${count('ready')} 已解析</span><span class="badge">${count('unsupported')} 格式未支持</span><span class="badge">${count('failed')} 失败</span></div>
${report.truncated ? '<p class="error">扫描达到上限（5,000 文件或 10,000 条目），结果不完整。请打开更小的目录。</p>' : ''}
<form id="search-form" class="row"><input id="query" placeholder="只在当前集合及子集合内查找…" maxlength="300" required><button>查找证据</button></form>
<p class="muted">范围：${escape(scope || '工作区根集合')}（含后代目录）。隐藏目录、符号链接及配置的排除目录不索引。搜索是文字检索，不是生成式问答。</p>
<h2>子集合</h2><div class="row">${directories.map(name => button(pathName(name), 'overview', { path: name })).join('') || '<span class="muted">没有直属子目录</span>'}</div>
<h2>知识来源</h2><table><thead><tr><th>来源</th><th>状态</th><th>操作</th></tr></thead><tbody>${sources.map(record => `<tr><td><span class="path">${escape(record.relativePath)}</span>${record.error ? `<p class="error">${escape(record.error)}</p>` : ''}</td><td>${escape(({ ready: '已解析', pending: '待处理', unsupported: '未支持', failed: '失败' })[record.status])}</td><td>${button('阅读', 'read', { path: record.relativePath })} ${button('历史', 'history', { path: record.relativePath })}</td></tr>`).join('')}</tbody></table>`;
}

function pathName(value: string): string {
  return value.split('/').pop() || value;
}

export function sourceContent(parsed: ParsedSource, relativePath: string, image?: Uri, versionLabel = '当前磁盘内容'): string {
  let graph = '';
  for (const [pageIndex, diagram] of (parsed.diagrams || []).entries()) {
    const minX = Math.min(0, ...diagram.nodes.map(node => node.x));
    const minY = Math.min(0, ...diagram.nodes.map(node => node.y));
    const maxX = Math.max(300, ...diagram.nodes.map(node => node.x + node.width));
    const maxY = Math.max(200, ...diagram.nodes.map(node => node.y + node.height));
    graph += `<h2>${escape(diagram.label)}</h2><svg class="diagram" viewBox="${minX - 20} ${minY - 20} ${maxX - minX + 40} ${maxY - minY + 40}" role="img" aria-label="${escape(diagram.label)}"><defs><marker id="arrow-${pageIndex}" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker></defs>`;
    for (const edge of diagram.edges) {
      const from = diagram.nodes.find(node => node.id === edge.source);
      const to = diagram.nodes.find(node => node.id === edge.target);
      if (!from || !to) continue;
      const x1 = from.x + from.width / 2, y1 = from.y + from.height / 2;
      const x2 = to.x + to.width / 2, y2 = to.y + to.height / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const fromScale = Math.min(from.width / 2 / Math.abs(dx), from.height / 2 / Math.abs(dy));
      const toScale = Math.min(to.width / 2 / Math.abs(dx), to.height / 2 / Math.abs(dy));
      if (Number.isFinite(fromScale) && Number.isFinite(toScale)) {
        graph += `<line x1="${x1 + dx * fromScale}" y1="${y1 + dy * fromScale}" x2="${x2 - dx * toScale}" y2="${y2 - dy * toScale}" marker-end="url(#arrow-${pageIndex})"/>`;
      }
      graph += `<text class="edge-label" x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}">${escape(edge.label)}</text>`;
    }
    for (const node of diagram.nodes) {
      graph += `<g class="node" data-action="focusBlock" data-id="${escape(`page-${pageIndex + 1}-node-${node.id}`)}"><rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="4"/><text x="${node.x + node.width / 2}" y="${node.y + node.height / 2 + 4}">${escape(node.label.slice(0, 40))}</text></g>`;
    }
    graph += '</svg>';
  }
  return `<p class="muted path">${escape(relativePath)} · ${escape(versionLabel)}${parsed.encoding ? ` · ${escape(parsed.encoding)}` : ''}</p>
<div class="row">${button('此文件的 Git 历史', 'history', { path: relativePath })}${button('用系统应用打开', 'external', { path: relativePath })}</div>
${parsed.notice ? `<p class="notice">${escape(parsed.notice)}</p>` : ''}
${image ? `<img class="source-image" src="${escape(image.toString())}" alt="${escape(parsed.title)}">` : ''}
${graph}
${parsed.blocks.map(block => `<article class="card evidence" id="${escape(block.id)}"><h3>${escape(block.label)}</h3><pre>${escape(block.text)}</pre></article>`).join('')}`;
}

export function searchContent(query: string, hits: SearchHit[]): string {
  return `<p>${escape(query)} · ${hits.length} 个相关片段（最多 100 条）</p>${hits.length ? '' : '<p class="notice">没有文字匹配。图片尚未 OCR；格式未支持或解析失败的来源不可全文检索。</p>'}
${hits.map(hit => `<article class="card"><h3>${escape(hit.relativePath)}</h3><span class="muted">${escape(hit.block.label)}</span><pre>${escape(hit.block.text.slice(0, 1800))}</pre>${button('打开证据', 'read', { path: hit.relativePath, block: hit.block.id })}</article>`).join('')}`;
}

export function historyContent(relativePath: string, history: { entries: HistoryEntry[]; branch: string; dirty: boolean }, directory: boolean): string {
  return `<p class="path">${escape(relativePath || '工作区根集合')}</p><p class="notice">分支：${escape(history.branch)} · 当前范围${history.dirty ? '存在未提交或未跟踪的变化' : '没有未提交变化'}。只展示当前分支第一父链最近 60 次相关提交，不自动切换分支、不联网、不执行仓库脚本。</p>
<p class="muted">下列比较均为“选定提交 ↔ 打开比较时的工作区快照”，不是相邻提交对照。再次修改文件后需重新发起比较。原始 Git 差异不包含未跟踪文件。提交说明是作者记录，不是工具验证过的变更原因。重命名前路径、已删除文件及历史图片预览尚未支持。</p>
${history.entries.length ? '' : '<p>当前范围没有可显示的提交。</p>'}
${history.entries.map(entry => `<article class="card history-entry"><div><h3>${escape(entry.subject)}</h3><span class="muted">${escape(entry.date)} · ${escape(entry.commit.slice(0, 12))}</span></div><div class="row">${directory ? '' : button('阅读此版本', 'snapshot', { path: relativePath, commit: entry.commit })}${directory ? '' : button('文字结构对照', 'compare', { path: relativePath, commit: entry.commit })}${button('Git 差异', 'diff', { path: relativePath, commit: entry.commit })}</div></article>`).join('')}`;
}
