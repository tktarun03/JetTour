// Structure tests: versions agree everywhere, load order, unique top-level names. Run: node tests/structure.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };

const html = read('index.html');
const version = read('js/core/config.js').match(/version:\s*'([^']+)'/)[1];
const swVersion = read('sw.js').match(/VERSION = '([^']+)'/)[1];
const relVersion = read('js/core/releases.js').match(/v:\s*'([^']+)'/)[1];
ok(swVersion === version, `sw.js VERSION ${swVersion} = APP.version ${version}`);
ok(relVersion === version, `RELEASES[0] ${relVersion} = APP.version`);
ok(read('CHANGELOG.md').includes(`## ${version}`), `CHANGELOG.md has ## ${version}`);
const assets = [...html.matchAll(/(?:src|href)="((?:js|css|icons|manifest|favicon)[^"]*)"/g)].map((m) => m[1]);
ok(assets.length > 20, `found ${assets.length} local assets`);
for (const a of assets) ok(a.endsWith(`?v=${version}`), `${a} carries ?v=${version}`);
for (const a of assets) ok(fs.existsSync(path.join(root, a.split('?')[0])), `${a.split('?')[0]} exists`);

// load order: core before data before ui before features before app
const scripts = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map((m) => m[1]);
const rank = (s) => (s.startsWith('js/core') ? 0 : s.startsWith('js/data') ? 1 : s.startsWith('js/ui') ? 2 : s.startsWith('js/features') ? 3 : 4);
ok(scripts.every((s, i) => i === 0 || rank(scripts[i - 1]) <= rank(s)), 'scripts load core → data → ui → features → app');
ok(scripts[scripts.length - 1] === 'js/app.js', 'app.js loads last');
// every js file on disk is loaded
const onDisk = [];
const walk = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.js') && onDisk.push(`${d}/${e.name}`)));
walk('js');
for (const f of onDisk) ok(scripts.includes(f), `${f} is loaded by index.html`);

// unique top-level names across the shared global scope
const names = new Map();
for (const f of scripts) {
  for (const m of read(f).matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    ok(!names.has(m[1]), `top-level name ${m[1]} (${f}) is unique${names.has(m[1]) ? ' — also in ' + names.get(m[1]) : ''}`);
    names.set(m[1], f);
  }
}
ok(!/innerHTML\s*=\s*[^;]*\$\{(?![^}]*Util\.esc)[^}]*(?:name|title|body)\b/.test(read('js/ui/toast.js')), 'toast escapes title/body');
console.log(failed ? `\n${failed} failed` : '\nall structure checks passed');
process.exit(failed ? 1 : 0);
