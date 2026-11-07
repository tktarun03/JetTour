// Builds dist/artifact.html: one self-contained page (CSS + JS inlined, icons as data URIs)
// for the Claude artifact mirror. The artifact host adds its own <html>/<head>/<body>.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let html = read('index.html');

html = html.replace(/<link rel="stylesheet" href="(css\/[^"?]+)[^"]*">/g, (_, p) => `<style>\n${read(p)}\n</style>`);
html = html.replace(/<script src="(js\/[^"?]+)[^"]*"><\/script>/g, (_, p) => `<script>\n${read(p).replace(/<\/script/gi, '<\\/script')}\n</script>`);
// drop PWA links the artifact frame can't use
html = html.replace(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n?/g, '');
html = html.replace(/<meta name="(apple-mobile-web-app-[^"]+|theme-color)"[^>]*>\n?/g, '');
// strip the document skeleton; keep title/meta/links/styles at the top
html = html.replace(/<!doctype html>\n?/i, '').replace(/<html[^>]*>\n?/, '').replace(/<\/html>\n?/, '')
  .replace(/<head>\n?/, '').replace(/<\/head>\n?/, '').replace(/<body>\n?/, '').replace(/<\/body>\n?/, '')
  .replace(/<meta charset="utf-8">\n?/, '').replace(/<meta name="viewport"[^>]*>\n?/, '');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/artifact.html'), html);
console.log(`dist/artifact.html ${(html.length / 1024).toFixed(0)} KB`);
