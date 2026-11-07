/* Small helpers shared by every feature. */
const Util = (() => {
  const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
  const num = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  /* Units. Lengths are stored in inches, distances in nm, volumes in cu ft. */
  const ftIn = (inches) => { const f = Math.floor(inches / 12); const i = Math.round(inches - f * 12); return i ? `${f} ft ${i} in` : `${f} ft`; };
  const m = (inches) => (inches * 0.0254).toFixed(2) + ' m';
  const len = (inches, units) => (units === 'metric' ? m(inches) : ftIn(inches));
  const dist = (nm, units) => (units === 'metric' ? `${num(Math.round(nm * 1.852))} km` : `${num(nm)} nm`);
  const distParts = (nm, units) => (units === 'metric' ? [num(Math.round(nm * 1.852)), 'km'] : [num(nm), 'nm']);
  const vol = (cuft, units) => (units === 'metric' ? `${(cuft * 0.0283168).toFixed(1)} m³` : `${num(cuft)} cu ft`);
  const alt = (ft, units) => (units === 'metric' ? `${num(Math.round(ft * 0.3048))} m` : `${num(ft)} ft`);
  const speed = (kt, units) => (units === 'metric' ? `${num(Math.round(kt * 1.852))} km/h` : `${num(kt)} kt`);
  const money = (lo, hi) => {
    const f = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M` : `$${num(v)}`);
    return hi && hi !== lo ? `${f(lo)}–${f(hi)}` : f(lo);
  };
  return { esc, num, $, $$, plural, ftIn, len, dist, distParts, vol, alt, speed, money };
})();
