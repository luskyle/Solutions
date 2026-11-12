const $ = (selector) => document.querySelector(selector);
const token = $('meta[name="knowledge-token"]').content;
const state = { current: null, documents: [], model: null, concept: null, busy: 0, selection: 0, graphRevision: 0 };
const labels = { pending: '待审核', accepted: '已确认', rejected: '已拒绝', observed: '结构关系' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function status(message, error = false) {
  $('#status').textContent = message;
  $('#status').classList.toggle('error', error);
}

async function api(route, body) {
  const response = await fetch(route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'X-Knowledge-Token': token, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
}

async function action(work) {
  state.busy++;
  updateControls();
  try {
    await work();
  } catch (error) {
    status(error.message, true);
  } finally {
    state.busy--;
    updateControls();
  }
}

function updateControls() {
  for (const selector of ['#import-library', '#upload', '#remove', '#extract']) {
    $(selector).disabled = state.busy > 0 || (selector === '#extract' && !state.model);
  }
}

async function refresh() {
  const [documents, info] = await Promise.all([api('/api/documents'), api('/api/status')]);
  state.documents = documents;
  state.model = info.model;
  $('#model-state').textContent = info.model ? `本机模型：${info.model}` : 'AI 未启用（使用 --model 启动后可用）';
  renderList(documents);
  updateControls();
  return info;
}

function renderList(items, search = false) {
  $('#list-title').textContent = search ? `搜索结果 · ${items.length}` : `知识来源 · ${items.length}`;
  const container = $('#documents');
  container.replaceChildren();
  if (!items.length) container.append(element('p', search ? '没有匹配的资料，试试更短的关键词。' : '尚未导入资料。', 'hint'));
  for (const item of items) {
    const id = item.document_id || item.id;
    const button = element('button', undefined, `document-item${state.current?.id === id ? ' selected' : ''}`);
    button.type = 'button';
    button.dataset.documentId = id;
    button.append(element('strong', item.title), element('small', item.name));
    if (search) {
      button.append(element('small', `第 ${item.start_line}–${item.end_line} 行`));
      button.append(element('div', item.excerpt.slice(0, 280), 'excerpt'));
    } else if (item.pending) button.append(element('small', `${item.pending} 条关系待审核`));
    button.addEventListener('click', () => action(() => selectDocument(id, item.start_line)));
    container.append(button);
  }
}

function showTab(name) {
  for (const tab of ['source', 'graph', 'assertions']) {
    $(`#${tab}-panel`).hidden = tab !== name;
    $(`[data-tab="${tab}"]`).setAttribute('aria-pressed', String(tab === name));
  }
}

function showLine(line, end = line) {
  showTab('source');
  for (const node of $('#source').children) {
    const number = Number(node.dataset.line);
    node.classList.toggle('highlight', number >= line && number <= end);
  }
  $(`#line-${line}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

async function selectDocument(id, line) {
  const selection = ++state.selection;
  const doc = await api(`/api/document?id=${encodeURIComponent(id)}`);
  if (selection !== state.selection) return;
  state.current = doc;
  state.concept = null;
  for (const item of document.querySelectorAll('.document-item')) {
    item.classList.toggle('selected', item.dataset.documentId === id);
  }
  $('#empty').hidden = true;
  $('#document').hidden = false;
  $('#document-title').textContent = doc.title;
  $('#document-meta').textContent = `${doc.name} · 版本 ${doc.version} · ${new Date(doc.updated_at).toLocaleString()}`;
  $('#source').replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const [index, text] of doc.content.split('\n').entries()) {
    const row = element('span', undefined, 'source-line');
    row.id = `line-${index + 1}`;
    row.dataset.line = index + 1;
    row.append(element('span', String(index + 1), 'line-number'), document.createTextNode(text || ' '));
    fragment.append(row);
  }
  $('#source').append(fragment);
  renderAssertions(doc);
  showTab('source');
  await renderGraph();
  if (line) showLine(line);
  status(`已打开：${doc.title}`);
}

function sourceButton(documentId, start, end = start) {
  const button = element('button', `查看证据 · 第 ${start}${end === start ? '' : `–${end}`} 行`, 'quiet');
  button.type = 'button';
  button.addEventListener('click', () => action(async () => {
    if (state.current?.id !== documentId) await selectDocument(documentId);
    showLine(start, end);
  }));
  return button;
}

function renderAssertions(doc) {
  const container = $('#assertions');
  container.replaceChildren();
  if (!doc.assertions.length) container.append(element('p', '还没有语义关系。可配置本地模型后主动抽取；结构性提及已可在图谱中查看。', 'hint'));
  for (const fact of doc.assertions) {
    const card = element('article', undefined, 'assertion-card');
    const title = element('strong', `${fact.subject_label} → ${fact.predicate} → ${fact.object_label}`);
    title.append(element('span', labels[fact.status], `state ${fact.status}`));
    card.append(title, element('blockquote', fact.quote));
    if (fact.qualifier) card.append(element('p', `适用条件：${fact.qualifier}`, 'hint'));
    const controls = element('div', undefined, 'row');
    controls.append(sourceButton(doc.id, fact.start_line, fact.end_line));
    for (const [value, label] of [['accepted', '确认'], ['rejected', '拒绝'], ['pending', '待审核']]) {
      const button = element('button', label, 'quiet');
      button.type = 'button';
      button.disabled = fact.status === value;
      button.addEventListener('click', () => action(async () => {
        await api('/api/review', { id: fact.id, status: value });
        await selectDocument(doc.id);
        showTab('assertions');
        await refresh();
        status(`关系已标记为${labels[value]}`);
      }));
      controls.append(button);
    }
    card.append(controls);
    container.append(card);
  }
}

function svgElement(tag, attributes = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

async function renderGraph() {
  if (!state.current) return;
  const selection = state.selection;
  const revision = ++state.graphRevision;
  const params = new URLSearchParams({
    ...(state.concept ? { concept: state.concept } : { document: state.current.id }),
    pending: String($('#include-pending').checked),
  });
  const graph = await api(`/api/graph?${params}`);
  if (selection !== state.selection || revision !== state.graphRevision) return;
  const svg = $('#graph');
  const list = $('#graph-edges');
  svg.replaceChildren();
  list.replaceChildren();
  const positions = new Map();
  const count = graph.nodes.length;
  graph.nodes.forEach((node, index) => {
    const ring = count > 24 && index % 2 === 0 ? 125 : 185;
    const angle = 2 * Math.PI * index / Math.max(count, 1) - Math.PI / 2;
    positions.set(node.id, count === 1 ? { x: 380, y: 240 } : { x: 380 + ring * 1.55 * Math.cos(angle), y: 240 + ring * Math.sin(angle) });
  });
  for (const edge of graph.edges) {
    const from = positions.get(edge.source);
    const to = positions.get(edge.target);
    const line = svgElement('line', { x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      class: `graph-edge ${edge.status}` });
    const title = svgElement('title');
    title.textContent = `${edge.label} · ${labels[edge.status]}`;
    line.append(title);
    svg.append(line);
    const card = element('div', undefined, 'edge-card');
    const names = new Map(graph.nodes.map((node) => [node.id, node.label]));
    card.append(element('p', `${names.get(edge.source)} → ${edge.label} → ${names.get(edge.target)}`));
    card.append(element('span', labels[edge.status], `state ${edge.status}`), sourceButton(edge.documentId, edge.line));
    if (edge.qualifier) card.append(element('p', edge.qualifier, 'hint'));
    list.append(card);
  }
  for (const node of graph.nodes) {
    const pos = positions.get(node.id);
    const group = svgElement('g', { class: `graph-node ${node.type}`, transform: `translate(${pos.x},${pos.y})`,
      tabindex: '0', role: 'button', 'aria-label': `${node.type === 'concept' ? '展开概念' : '打开来源'}：${node.label}` });
    const circle = svgElement('circle', { r: node.type === 'document' ? 12 : 8 });
    const hitArea = svgElement('rect', { x: -48, y: -18, width: 96, height: 56, fill: 'transparent' });
    const title = svgElement('title');
    title.textContent = node.label;
    const text = svgElement('text', { y: 27 });
    text.textContent = node.label.length > 16 ? `${node.label.slice(0, 15)}…` : node.label;
    group.append(hitArea, circle, title, text);
    const expand = () => action(async () => {
      if (node.type === 'document') await selectDocument(node.id);
      else {
        state.concept = node.id;
        await renderGraph();
      }
      showTab('graph');
    });
    group.addEventListener('click', expand);
    group.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        expand();
      }
    });
    svg.append(group);
  }
  if (!graph.edges.length) list.append(element('p', '暂无可显示的关系。Markdown 行内代码可生成“提及”关系；审核通过的 AI 关系也会显示在这里。', 'hint'));
  else list.append(element('p', '局部视图每类最多显示 80 条关系；可点击概念继续探索。', 'hint'));
}

$('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  action(async () => {
    const items = await api(`/api/search?q=${encodeURIComponent($('#query').value)}`);
    renderList(items, true);
    status(`找到 ${items.length} 个相关内容块（最多显示 30 个）`);
  });
});
$('#show-all').addEventListener('click', () => action(refresh));
for (const tab of document.querySelectorAll('[data-tab]')) tab.addEventListener('click', () => showTab(tab.dataset.tab));
$('#include-pending').addEventListener('change', () => action(renderGraph));
$('#reset-graph').addEventListener('click', () => action(async () => { state.concept = null; await renderGraph(); }));
$('#import-library').addEventListener('click', () => action(async () => {
  status('正在导入项目文档，不扫描私有或隐藏目录…');
  const report = await api('/api/import-library', { legacyEncoding: $('#legacy-encoding').value || undefined });
  $('#report').hidden = false;
  $('#report-content').textContent = JSON.stringify(report, null, 2);
  await refresh();
  status(`新增 ${report.imported} · 更新 ${report.updated} · 未变 ${report.unchanged} · 跳过 ${report.skipped.length} · 失败 ${report.failed.length}`, report.failed.length > 0);
}));
$('#upload').addEventListener('change', () => action(async () => {
  const files = [...$('#upload').files];
  const report = [];
  for (const file of files) {
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('文件超过 2 MiB');
      const { text, encoding } = decodeText(new Uint8Array(await file.arrayBuffer()), $('#legacy-encoding').value || undefined);
      report.push({ ...await api('/api/import', { name: file.name, content: text }), encoding });
    } catch (error) {
      report.push({ name: file.name, status: 'failed', error: error.message });
    }
  }
  $('#upload').value = '';
  $('#report').hidden = false;
  $('#report-content').textContent = JSON.stringify(report, null, 2);
  await refresh();
  const failed = report.filter((item) => item.status === 'failed').length;
  status(`文件处理完成：成功 ${report.length - failed}，失败 ${failed}`, failed > 0);
}));
$('#remove').addEventListener('click', () => {
  if (!state.current || !confirm('删除该来源及其索引、提及和知识断言？其他来源的证据会保留。')) return;
  action(async () => {
    await api('/api/remove', { id: state.current.id });
    state.selection++;
    state.current = null;
    $('#document').hidden = true;
    $('#empty').hidden = false;
    await refresh();
    status('来源及其派生数据已删除');
  });
});
$('#extract').addEventListener('click', () => action(async () => {
  if (!state.current) return;
  const id = state.current.id;
  status('本地模型正在抽取候选关系，可能需要几分钟…');
  const result = await api('/api/extract', { id });
  await selectDocument(id);
  showTab('assertions');
  await refresh();
  status(`已抽取 ${result.extracted} 条候选关系，请审核证据与适用条件`);
}));

action(async () => {
  const info = await refresh();
  status(`本地知识库已连接 · ${info.documents} 份来源 · ${info.model ? '本地 AI 已配置，需主动点击调用' : 'AI 未启用，无模型也可使用'}`);
});
import { decodeText } from '/text.js';
