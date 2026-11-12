import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, writeFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const checkout = path.join(root, '.desktop', 'code-oss');
const extension = path.join(root, 'desktop', 'extension');
const upstream = JSON.parse(await readFile(new URL('./upstream.json', import.meta.url), 'utf8'));
const branding = JSON.parse(await readFile(new URL('./product.json', import.meta.url), 'utf8'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nativeRoot = path.join(root, '.desktop', 'native', 'sysroot', 'usr');
const buildEnv = {
  NODE_USE_ENV_PROXY: '1',
  ...(await exists(nativeRoot) ? {
    CPLUS_INCLUDE_PATH: [path.join(nativeRoot, 'include'), process.env.CPLUS_INCLUDE_PATH].filter(Boolean).join(path.delimiter),
    LIBRARY_PATH: [path.join(nativeRoot, 'lib', 'x86_64-linux-gnu'), path.join(nativeRoot, 'lib', 'x86_64-linux-gnu', 'mit-krb5'), process.env.LIBRARY_PATH].filter(Boolean).join(path.delimiter),
    PKG_CONFIG_PATH: [path.join(nativeRoot, 'lib', 'x86_64-linux-gnu', 'pkgconfig'), process.env.PKG_CONFIG_PATH].filter(Boolean).join(path.delimiter),
  } : {}),
};

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function run(command, args, cwd = root, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', env: { ...process.env, ...buildEnv, ...extraEnv }, shell: process.platform === 'win32' });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code ?? signal}`)));
  });
}

async function brand() {
  const productPath = path.join(checkout, 'product.json');
  const product = JSON.parse(await readFile(productPath, 'utf8'));
  for (const key of ['extensionsGallery', 'defaultChatAgent', 'configurationSync', 'updateUrl', 'aiConfig']) delete product[key];
  await writeFile(productPath, `${JSON.stringify({ ...product, ...branding }, null, '\t')}\n`);
  for (const name of (await readdir(path.join(root, 'desktop', 'patches'))).filter(name => name.endsWith('.patch')).sort()) {
    const patch = path.join(root, 'desktop', 'patches', name);
    const applied = spawnSync('git', ['apply', '--reverse', '--check', patch], { cwd: checkout, encoding: 'utf8' });
    if (applied.status !== 0) await run('git', ['apply', patch], checkout);
  }
}

async function installExtension() {
  await run(npm, ['run', 'build'], extension);
  const destination = path.join(checkout, 'extensions', 'solutions-knowledge');
  await mkdir(destination, { recursive: true });
  for (const name of ['package.json', 'dist', 'media']) {
    await cp(path.join(extension, name), path.join(destination, name), { recursive: true });
  }
  await cp(path.join(root, 'LICENSE'), path.join(destination, 'LICENSE'));
}

const [command = 'start', ...args] = process.argv.slice(2);
try {
  if (command === 'brand') {
    await brand();
  } else if (command === 'prepare') {
    if (!await exists(path.join(checkout, '.git'))) {
      await mkdir(path.dirname(checkout), { recursive: true });
      await run('git', ['clone', '--depth', '1', '--branch', upstream.tag, upstream.repository, checkout]);
    }
    const { execFileSync } = await import('node:child_process');
    const actual = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: checkout, encoding: 'utf8' }).trim();
    if (actual !== upstream.commit) throw new Error('Unexpected upstream checkout; refusing to overwrite it');
    const [major, minor, patch] = process.versions.node.split('.').map(Number);
    const required = upstream.node.split('.').map(Number);
    if (major !== required[0] || minor < required[1] || (minor === required[1] && patch < required[2])) {
      throw new Error(`Use Node ${upstream.node}+ with major ${required[0]} for the pinned upstream`);
    }
    await brand();
    if (!await exists(path.join(extension, 'node_modules', 'typescript'))) await run(npm, ['ci'], extension);
    await run(process.execPath, ['build/npm/preinstall.ts'], checkout);
    await run(npm, ['run', 'install-fast'], checkout);
    await run(npm, ['run', 'build-fast', '--', '--client-only'], checkout);
    await run(npm, ['run', 'gulp', 'transpile-extensions', 'compile-extension-media'], checkout);
    await run(npm, ['run', 'electron'], checkout);
    await installExtension();
    console.log('Desktop build ready. Run npm start -- /absolute/path/to/your/folder');
  } else if (command === 'sync') {
    await installExtension();
  } else if (command === 'start') {
    const executable = process.platform === 'darwin'
      ? path.join(checkout, '.build', 'electron', `${branding.nameLong}.app`, 'Contents', 'MacOS', branding.nameShort)
      : path.join(checkout, '.build', 'electron', process.platform === 'win32' ? `${branding.nameShort}.exe` : branding.applicationName);
    if (!await exists(executable) || !await exists(path.join(checkout, 'out', 'main.js'))) {
      throw new Error('Desktop is not built. Run npm run desktop:prepare first (see desktop/README.md)');
    }
    await installExtension();
    const profile = path.join(root, '.desktop', 'user-data');
    await mkdir(path.join(profile, 'User'), { recursive: true });
    const settings = path.join(profile, 'User', 'settings.json');
    if (!await exists(settings)) {
      await cp(path.join(root, 'desktop', 'settings.json'), settings);
    }
    const launchArguments = args.length && !args[0].startsWith('-')
      ? [path.resolve(process.cwd(), args[0]), ...args.slice(1)] : args;
    await run(executable, [
      checkout, '--user-data-dir', profile, '--extensions-dir', path.join(root, '.desktop', 'user-extensions'),
      '--skip-welcome', '--skip-release-notes', '--new-window',
      '--disable-extension=GitHub.copilot-chat',
      '--disable-extension=vscode.vscode-api-tests',
      ...launchArguments,
    ], checkout, { VSCODE_DEV: '1', NODE_ENV: 'development' });
  } else {
    throw new Error(`Unknown desktop command: ${command}`);
  }
} catch (error) {
  console.error(`Desktop error: ${error.message}`);
  process.exitCode = 1;
}
