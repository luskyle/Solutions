import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, rm, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const checkout = path.join(root, '.desktop', 'code-oss');
const requireUpstream = createRequire(path.join(checkout, 'package.json'));
const { _electron } = requireUpstream('playwright');
const requireExtension = createRequire(path.join(root, 'desktop', 'extension', 'package.json'));
const { zipSync, strToU8 } = requireExtension('fflate');
const temporary = await mkdtemp(path.join(tmpdir(), 'knowledge-desktop-smoke-'));
const workspace = path.join(temporary, 'workspace');
await mkdir(path.join(workspace, 'Project A'), { recursive: true });
const word = (value) => zipSync({ 'word/document.xml': strToU8(`<w:document xmlns:w="urn:w"><w:body><w:p><w:r><w:t>${value}</w:t></w:r></w:p></w:body></w:document>`) });
await writeFile(path.join(workspace, 'Project A', 'requirements.docx'), word('OLD_RULE'));
await writeFile(path.join(workspace, 'Project A', 'notes.md'), '# Evidence\nWORKSPACE_SEARCH_MARKER');
await writeFile(path.join(workspace, 'Project A', 'slides.pptx'), zipSync({
  'ppt/presentation.xml': strToU8('<p:presentation xmlns:p="urn:p" xmlns:r="urn:r"><p:sldIdLst><p:sldId r:id="first"/></p:sldIdLst></p:presentation>'),
  'ppt/_rels/presentation.xml.rels': strToU8('<Relationships><Relationship Id="first" Target="slides/slide1.xml"/></Relationships>'),
  'ppt/slides/slide1.xml': strToU8('<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><a:p><a:r><a:t>SLIDE_MARKER</a:t></a:r></a:p></p:sld>'),
}));
await writeFile(path.join(workspace, 'Project A', 'flow.drawio'), '<mxfile><diagram name="Review"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="review" value="REVIEW_NODE" vertex="1" parent="1"><mxGeometry x="10" y="10" width="160" height="50" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>');
await writeFile(path.join(workspace, 'Project A', 'image.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6ZQAAAABJRU5ErkJggg==', 'base64'));
const git = (...args) => execFileSync('git', args, { cwd: workspace, stdio: 'pipe' });
git('init', '-q');
git('config', 'user.name', 'Smoke Test');
git('config', 'user.email', 'smoke@example.invalid');
git('add', '.');
git('commit', '-qm', 'Initial knowledge');
await writeFile(path.join(workspace, 'Project A', 'requirements.docx'), word('NEW_RULE'));
await mkdir(path.join(temporary, 'profile', 'User'), { recursive: true });
await writeFile(path.join(temporary, 'profile', 'User', 'settings.json'), await readFile(new URL('./settings.json', import.meta.url)));
let application;
let diagnostic = '';
try {
  const executable = process.platform === 'darwin'
    ? path.join(checkout, '.build', 'electron', 'Knowledge Workbench.app', 'Contents', 'MacOS', 'Knowledge Workbench')
    : path.join(checkout, '.build', 'electron', process.platform === 'win32' ? 'Knowledge Workbench.exe' : 'knowledge-workbench');
  application = await _electron.launch({
    executablePath: executable,
    args: [checkout, workspace, '--user-data-dir', path.join(temporary, 'profile'), '--extensions-dir', path.join(temporary, 'extensions'),
      '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust', '--disable-gpu',
      '--disable-extension=GitHub.copilot-chat', '--disable-extension=vscode.vscode-api-tests'],
    env: { ...process.env, VSCODE_DEV: '1', NODE_ENV: 'development' },
    timeout: 60000,
  });
  const window = await application.firstWindow({ timeout: 60000 });
  application.process().stderr?.on('data', data => { diagnostic = (diagnostic + data.toString()).slice(-8000); });
  window.setDefaultTimeout(30000);
  const errors = [];
  window.on('pageerror', error => errors.push(error.message));
  const findView = async (needle) => {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      for (const frame of [...window.frames()].reverse()) {
        try {
          if (frame.isDetached()) continue;
          let visible = true;
          for (let ancestor = frame; ancestor.parentFrame(); ancestor = ancestor.parentFrame()) {
            if (!await (await ancestor.frameElement()).isVisible()) { visible = false; break; }
          }
          if (!visible) continue;
          if (await frame.locator('body').innerText().then(text => text.includes(needle))) return frame;
        } catch (error) {
          if (!/Frame has been detached|frame was detached|Execution context was destroyed/i.test(error.message)) throw error;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error(`Knowledge view did not appear: ${needle}`);
  };
  const overview = await findView('文件夹是集合');
  await overview.getByRole('button', { name: 'Project A', exact: true }).click();
  const collection = await findView('范围：Project A（含后代目录）');
  await collection.locator('#query').fill('WORKSPACE_SEARCH_MARKER');
  await collection.locator('#search-form button').click();
  const results = await findView('WORKSPACE_SEARCH_MARKER ·');
  await results.getByRole('button', { name: '打开证据', exact: true }).click();
  const evidence = await findView('当前磁盘内容');
  await evidence.locator('.evidence.focused').waitFor();
  await evidence.getByRole('button', { name: '集合概览', exact: true }).click();
  const folder = await findView('范围：Project A（含后代目录）');
  const row = folder.locator('tr').filter({ hasText: 'Project A/requirements.docx' });
  await row.getByRole('button', { name: '阅读', exact: true }).click();
  await findView('NEW_RULE');
  for (const [filename, marker] of [['slides.pptx', 'SLIDE_MARKER'], ['flow.drawio', 'REVIEW_NODE'], ['image.png', '原图预览']]) {
    const active = await findView(filename === 'slides.pptx' ? 'NEW_RULE' : filename === 'flow.drawio' ? 'SLIDE_MARKER' : 'REVIEW_NODE');
    await active.getByRole('button', { name: '集合概览', exact: true }).click();
    const listing = await findView('范围：Project A（含后代目录）');
    await listing.locator('tr').filter({ hasText: `Project A/${filename}` }).getByRole('button', { name: '阅读', exact: true }).click();
    const reader = await findView(marker);
    if (filename === 'image.png') await reader.waitForFunction(() => {
      const image = document.querySelector('.source-image');
      return image?.complete && image.naturalWidth > 0;
    });
    if (filename === 'flow.drawio') {
      await reader.locator('svg .node').click();
      await reader.locator('.evidence.focused').waitFor();
    }
  }
  const image = await findView('原图预览');
  await image.getByRole('button', { name: '集合概览', exact: true }).click();
  const finalListing = await findView('范围：Project A（含后代目录）');
  await finalListing.locator('tr').filter({ hasText: 'Project A/requirements.docx' }).getByRole('button', { name: '阅读', exact: true }).click();
  const currentDoc = await findView('NEW_RULE');
  await currentDoc.getByRole('button', { name: '此文件的 Git 历史', exact: true }).click();
  const history = await findView('Initial knowledge');
  await history.getByRole('button', { name: '阅读此版本', exact: true }).click();
  const old = await findView('OLD_RULE');
  assert.match(await old.locator('body').innerText(), /历史版本/);
  assert.equal((await old.locator('.path').first().innerText()).includes('当前磁盘内容'), false);
  await old.getByRole('button', { name: '此文件的 Git 历史', exact: true }).click();
  const compareHistory = await findView('Initial knowledge');
  await compareHistory.getByRole('button', { name: '文字结构对照', exact: true }).click();
  await window.locator('.monaco-diff-editor').waitFor({ state: 'visible' });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ desktop: true, collection: true, scopedSearch: true, evidence: true, docx: true, pptx: true, drawio: true, image: true, gitHistory: true, historicalSource: true, versionCompare: true }));
} catch (error) {
  if (application) {
    const window = await application.firstWindow();
    console.error('Desktop title:', await window.title());
    console.error('Desktop state:', (await window.locator('body').innerText()).slice(-3500));
    console.error('Frames:', window.frames().map(frame => frame.url()));
    console.error('Console:', (await window.consoleMessages()).map(message => `${message.type()}: ${message.text()}`).slice(-12));
    console.error('Page errors:', (await window.pageErrors()).map(error => error.message));
    console.error('Process diagnostics:', diagnostic);
    const logs = path.join(temporary, 'profile', 'logs');
    for (const name of (await readdir(logs, { recursive: true })).filter(name => /(?:main|renderer|exthost)\.log$/.test(name))) {
      const content = await readFile(path.join(logs, name), 'utf8');
      console.error(name, content.split('\n').filter(line => /error|Error|warn|WARN/.test(line)).slice(-10).join('\n'));
    }
    await window.screenshot({ path: path.join(root, '.desktop', 'smoke-failure.png') });
  }
  throw error;
} finally {
  if (application) await application.close();
  await rm(temporary, { recursive: true, force: true });
}
