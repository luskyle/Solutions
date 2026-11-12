import { build } from 'esbuild';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const result = await build({
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  external: ['vscode'],
  sourcemap: true,
  metafile: true,
});
const dependencies = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  const parts = input.split('/');
  const position = parts.lastIndexOf('node_modules');
  if (position < 0) continue;
  const end = position + (parts[position + 1].startsWith('@') ? 3 : 2);
  dependencies.add(parts.slice(0, end).join('/'));
}
const notices = [];
const supplementalLicenses = new Map([
  ['@nodable/entities@3.1.0', 'licenses/nodable-entities-LICENSE.txt'],
]);
for (const directory of [...dependencies].sort()) {
  const metadata = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  const licenses = (await readdir(directory)).filter(name => /^licen[cs]e(?:\..*)?$/i.test(name));
  const contents = await Promise.all(licenses.map(name => readFile(path.join(directory, name), 'utf8')));
  const supplemental = supplementalLicenses.get(`${metadata.name}@${metadata.version}`);
  if (!contents.length && supplemental) contents.push(await readFile(supplemental, 'utf8'));
  if (!contents.length) throw new Error(`Missing third-party license: ${metadata.name}`);
  notices.push(`${metadata.name} ${metadata.version}\n${contents.join('\n')}`);
}
await writeFile('dist/THIRD_PARTY_NOTICES.txt', notices.join('\n\n--------------------\n\n'));
