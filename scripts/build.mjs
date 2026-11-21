import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
const cmd = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const result = spawnSync(cmd, ['-p', join(root, 'tsconfig.json')], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
if (result.status !== 0) {
  console.error('Build failed. Run "npm install" to install TypeScript, then retry.');
  process.exit(result.status || 1);
}
for (const f of ['index.html', 'manifest.webmanifest', 'sw.js', 'robots.txt']) cpSync(join(root, f), join(dist, f));
cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true, force: true });
cpSync(join(root, 'src', 'styles.css'), join(dist, 'assets', 'styles.css'));
// Bundle offline QR decoder for browsers without native BarcodeDetector.
cpSync(join(root, 'node_modules', 'jsqr', 'dist', 'jsQR.js'), join(dist, 'assets', 'jsqr.js'));
cpSync(join(root, 'vendor', 'THIRD_PARTY_LICENSE_APACHE_2.txt'), join(dist, 'assets', 'THIRD_PARTY_LICENSE_APACHE_2.txt'));

// Offline browser bundle of the unmodified MIT-licensed Arase QR encoder,
// as vendored in qrcode-terminal (Apache-2.0 distribution). See vendor/README.md.
const source = join(root, 'vendor', 'qr');
const names = readdirSync(source).filter(f => f.endsWith('.js'));
const parts = names.map(name => {
  const id = name.slice(0, -3);
  const code = readFileSync(join(source, name), 'utf8');
  return `${JSON.stringify(id)}: function(require, module, exports) {\n${code}\n}`;
});
const bundle = `(function (global) {\n'use strict';\nconst modules = {${parts.join(',\n')}};\nconst cache = {};\nfunction require(name) {\n  const id = name.replace(/^\\.\\//, '');\n  if (!cache[id]) {\n    if (!Object.hasOwn(modules, id)) throw new Error('QR module not found: ' + id);\n    const module = { exports: {} };\n    cache[id] = module;\n    modules[id](require, module, module.exports);\n  }\n  return cache[id].exports;\n}\nglobal.GhostQR = { QRCode: require('index'), correction: require('QRErrorCorrectLevel') };\n})(globalThis);\n`;
writeFileSync(join(dist, 'assets', 'qr-vendor.js'), bundle);
console.log('GhostSignal build complete -> dist/');
