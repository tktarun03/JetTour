// Browser flow tests (Playwright library, no test runner needed). Run: node tests/flows.test.mjs
// Covers: intro, fleet, overview, seats, interior, compare, saved, settings, toasts + Undo, layout at 3 phone sizes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };
const browser = await chromium.launch();
const SHOTS = process.env.SHOTS; // folder for screenshots, optional

async function fresh(vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: true });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, errors };
}
// Seed storage from a same-origin page that is not the app, so the running app cannot overwrite it.
async function seed(page, data) {
  await page.goto(base + 'icons/icon.svg');
  await page.evaluate((d) => localStorage.setItem('jettour.v1', JSON.stringify(d)), data);
}
const toastText = (page) => page.locator('#toast.show strong').textContent();
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('jettour.v1')));

// 1. Intro → fleet
{
  const { ctx, page, errors } = await fresh();
  await page.goto(base);
  ok(await page.locator('#intro').isVisible(), 'intro shows on first visit');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/01-intro.png` });
  await page.click('#intro [data-i="next"]'); await page.waitForTimeout(450);
  await page.click('#intro [data-i="next"]'); await page.waitForTimeout(450);
  ok((await page.locator('#intro [data-i="next"]').textContent()) === 'Explore the fleet', 'last intro button says Explore the fleet');
  await page.click('#intro [data-i="next"]');
  ok(await page.locator('#intro').count() === 0, 'intro closes');
  ok(await page.locator('.jet-card').count() === 12, '12 aircraft on the fleet screen');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/02-fleet.png` });
  await page.reload();
  ok(await page.locator('#intro').count() === 0, 'intro does not show again');
  await page.click('.chip[data-v="large"]');
  ok(await page.locator('.jet-card').count() === 4, 'Large filter shows 4');
  await page.selectOption('#sort', 'maker');
  ok((await page.locator('.jet-card .maker').first().textContent()) === 'Bombardier', 'sort by maker');
  ok(errors.length === 0, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

// 2. Overview → save with Undo → compare with Undo → seat with Undo → interior
{
  const { ctx, page, errors } = await fresh();
  await seed(page, { introDone: true, lastVersion: '1.0.0' });
  await page.goto(base + '#jet-global7500');
  ok((await page.locator('.model-line .m').textContent()) === 'Global 7500', 'overview opens Global 7500');
  ok(await page.locator('.spec-row').count() >= 15, 'spec list rendered');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/03-overview.png`, fullPage: false });

  await page.click('.action-bar [data-act="save"]');
  ok((await toastText(page)) === 'Saved Global 7500', 'save notice text');
  ok((await store(page)).saved.includes('global7500'), 'saved in storage');
  await page.waitForTimeout(5500);
  ok(await page.locator('#toast.show').count() === 1, 'notice with Undo still visible at 5.5 s');
  await page.click('#toast [data-t="act"]');
  ok(!(await store(page)).saved.includes('global7500'), 'Undo removes the save');

  await page.click('.action-bar [data-act="compare"]');
  ok((await toastText(page)) === 'Added to compare', 'compare notice');
  await page.click('#toast [data-t="act"]');
  ok((await store(page)).compare.length === 0, 'Undo empties compare');

  await page.goto(base + '#seats-global7500');
  await page.locator('.fp-seat[data-seat="3B"]').click();
  ok((await page.locator('#seat-card .eyebrow').textContent()).includes('3B'), 'tapping seat 3B updates the card');
  ok((await page.locator('#seat-card h3').textContent()) === 'Dining chair', 'seat 3B is a dining chair');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/04-seats.png` });
  await page.click('[data-act="pick-seat"]');
  ok((await store(page)).seats.global7500 === '3B', 'seat saved');
  ok(await page.locator('.fp-seat.mine[data-seat="3B"]').count() === 1, 'seat drawn as mine');
  await page.click('#toast [data-t="act"]');
  ok(!(await store(page)).seats.global7500, 'Undo clears the seat');

  await page.goto(base + '#cabin-global7500');
  await page.click('[data-act="zone"][data-v="3"]');
  ok((await page.locator('.zone-card h3').textContent()) === 'Entertainment suite', 'section 4 is the Entertainment suite');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/05-interior.png` });
  ok(errors.length === 0, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

// 3. Compare full, clear + Undo; settings; plain notice timing; update notice once
{
  const { ctx, page, errors } = await fresh();
  await seed(page, { introDone: true, lastVersion: '0.9.0' });
  await page.goto(base + '#compare');
  await page.waitForTimeout(800);
  ok((await toastText(page)) === `Updated to version ${await page.evaluate(() => APP.version)}`, 'update notice after a version change');
  await page.reload(); await page.waitForTimeout(800);
  ok(await page.locator('#toast.show').count() === 0, 'update notice shown only once');
  for (const id of ['g700', 'global7500', 'falcon8x']) await page.click(`.cmp-pick [data-id="${id}"]`);
  await page.click('.cmp-pick [data-id="g800"]');
  ok((await toastText(page)) === 'Compare is full', 'fourth jet is refused');
  ok(await page.locator('.cmp-table thead th').count() === 4, 'table shows 3 jets');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/06-compare.png` });
  await page.click('[data-act="clear-compare"]');
  ok((await store(page)).compare.length === 0, 'clear empties list');
  await page.click('#toast [data-t="act"]');
  ok((await store(page)).compare.length === 3, 'Undo restores all three');

  await page.goto(base + '#more');
  await page.click('[data-act="pref"][data-k="units"][data-v="metric"]');
  ok((await store(page)).units === 'metric', 'metric saved');
  await page.goto(base + '#jet-g700');
  ok((await page.locator('.spec-list').textContent()).includes('km'), 'specs show km in metric');
  await page.goto(base + '#more');
  await page.click('[data-act="pref"][data-k="theme"][data-v="dark"]');
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'dark theme applied');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/07-more-dark.png` });
  await page.click('[data-act="selfcheck"]');
  ok((await toastText(page)) === 'All checks passed', 'self-check passes in the browser');
  await page.waitForTimeout(4800);
  ok(await page.locator('#toast.show').count() === 0, 'plain notice gone after ~4.5 s');
  // restore round trip
  const backup = await page.evaluate(() => Store.exportJSON());
  await page.click('[data-act="reset"]'); await page.click('[data-act="reset-yes"]');
  ok((await store(page)).compare.length === 0, 'erase clears data');
  await page.fill('#restore-box', backup); await page.click('[data-act="restore"]');
  ok((await store(page)).compare.length === 3, 'restore brings data back');
  await page.fill('#restore-box', 'not json'); await page.click('[data-act="restore"]');
  ok((await toastText(page)) === "Couldn't read that backup", 'bad backup gives a clear error');
  ok(errors.length === 0, `no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

// 4. Layout at three phone sizes, every route, light and dark
for (const vp of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  const { ctx, page, errors } = await fresh(vp);
  await seed(page, { introDone: true, lastVersion: '1.0.0', compare: ['g700', 'cj4gen2', 'falcon8x'] });
  for (const r of ['fleet', 'jet-phenom300e', 'seats-g700', 'cabin-falcon8x', 'compare', 'saved', 'more']) {
    await page.goto(base + '#' + r); await page.reload();
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(sw <= 0, `${vp.width}×${vp.height} #${r}: no horizontal scroll (${sw})`);
    const tab = await page.locator('.tabbar').boundingBox();
    ok(tab && tab.y + tab.height <= vp.height + 1, `${vp.width}×${vp.height} #${r}: tab bar fully visible`);
    const bar = await page.locator('.action-bar').boundingBox().catch(() => null);
    if (bar) ok(bar.y + bar.height <= tab.y, `${vp.width}×${vp.height} #${r}: action bar sits above tab bar`);
    const small = await page.evaluate(() => Array.from(document.querySelectorAll('#view *')).filter((e) => e.childElementCount === 0 && e.textContent.trim() && !e.closest('svg') && parseFloat(getComputedStyle(e).fontSize) < 11).length);
    ok(small === 0, `${vp.width}×${vp.height} #${r}: no text under 11px`);
  }
  ok(errors.length === 0, `${vp.width}: no console errors (${errors.join(' | ')})`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} failed` : '\nall flow tests passed');
process.exit(failed ? 1 : 0);
