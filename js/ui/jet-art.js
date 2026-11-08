/* Original business-jet drawings, built from each aircraft's proportions.
   Not a reproduction of any manufacturer artwork.
   - plan():  3/4 view from above (fleet cards)
   - side():  side view with door + airstair, optional cabin cutaway and section hotspots
   - cross(): cabin cross-section to scale */
const JetArt = (() => {
  let uid = 0;
  const f = (n) => Math.round(n * 10) / 10;

  /* ---------- 3/4 view ---------- */
  function plan(jet, opts = {}) {
    const id = 'p' + (++uid);
    const L = jet.art.len * 0.98;
    const w = L * 0.115;
    const k = 0.4, r = -13 * Math.PI / 180;
    const cx = 330, cy = 150;
    const finH = L * (jet.art.tri ? 0.085 : 0.095);
    const P = (x, y, z = 0) => {
      const rx = x * Math.cos(r) - y * Math.sin(r);
      const ry = x * Math.sin(r) + y * Math.cos(r);
      return [f(cx + rx), f(cy + ry * k - z)];
    };
    const path = (pts) => 'M' + pts.map((p) => P(p[0], p[1], p[2] || 0).join(',')).join(' L') + ' Z';
    const g = [];
    const H = L / 2;

    g.push(`<defs>
      <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${-w / 2}" x2="0" y2="${w / 2}">
        <stop offset="0" stop-color="var(--jet-body)"/><stop offset=".55" stop-color="var(--jet-body)"/><stop offset="1" stop-color="var(--jet-shade)"/>
      </linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--jet-body)"/><stop offset="1" stop-color="var(--jet-shade)"/></linearGradient>
    </defs>`);

    // ground shadow
    const sh = P(0, 0);
    g.push(`<ellipse cx="${sh[0] + 30}" cy="${sh[1] + 70}" rx="${L * 0.36}" ry="10" fill="var(--ink)" opacity=".07"/>`);

    // far wing (−y), behind fuselage
    const wing = (s) => [[-0.04 * L, s * w * 0.4], [0.15 * L, s * w * 0.4], [0.25 * L, s * 0.36 * L], [0.2 * L, s * 0.36 * L]];
    g.push(`<path d="${path(wing(-1))}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1" stroke-linejoin="round"/>`);
    // far winglet
    const fwt = P(0.2 * L, -0.36 * L), fwt2 = P(0.25 * L, -0.36 * L);
    g.push(`<path d="M${fwt[0]},${fwt[1]} L${fwt[0] + 5},${fwt[1] - 12} L${fwt2[0] + 4},${fwt2[1] - 12} L${fwt2[0]},${fwt2[1]} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width=".8"/>`);

    // far engine
    const eng = (s) => [[0.24 * L, s * w * 0.95], [0.37 * L, s * w * 0.95], [0.37 * L, s * w * 0.38], [0.24 * L, s * w * 0.38]];
    g.push(`<path d="${path(eng(-1).map((p) => [p[0], p[1], w * 0.3]))}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1"/>`);

    // fuselage (planform capsule)
    const fus = `M${P(-H, 0)} C${P(-H, -w * 0.38)} ${P(-H + 0.05 * L, -w / 2)} ${P(-H + 0.13 * L, -w / 2)} L${P(H - 0.2 * L, -w / 2)} C${P(H - 0.08 * L, -w / 2)} ${P(H - 0.02 * L, -w * 0.2)} ${P(H, -w * 0.09)} L${P(H, w * 0.09)} C${P(H - 0.02 * L, w * 0.2)} ${P(H - 0.08 * L, w / 2)} ${P(H - 0.2 * L, w / 2)} L${P(-H + 0.13 * L, w / 2)} C${P(-H + 0.05 * L, w / 2)} ${P(-H, w * 0.38)} ${P(-H, 0)} Z`;
    g.push(`<path d="${fus}" fill="var(--jet-body)" stroke="var(--jet-line)" stroke-width="1.1"/>`);
    // underside shade band on the near side
    const band = `M${P(-H + 0.06 * L, w * 0.3)} L${P(H - 0.12 * L, w * 0.3)} L${P(H - 0.17 * L, w * 0.5)} L${P(-H + 0.12 * L, w * 0.5)} Z`;
    g.push(`<path d="${band}" fill="var(--jet-shade)" opacity=".85"/>`);
    // trim line
    g.push(`<path d="M${P(-H + 0.08 * L, w * 0.27)} L${P(H - 0.1 * L, w * 0.18)}" stroke="var(--trim)" stroke-width="1.6" fill="none"/>`);

    // windows along the near side
    const n = winCount(jet);
    for (let i = 0; i < n; i++) {
      const x = -0.3 * L + (0.43 * L) * (i / Math.max(1, n - 1));
      const [wx, wy] = P(x, w * 0.2);
      g.push(jet.art.win === 'oval'
        ? `<ellipse cx="${wx}" cy="${wy}" rx="2.4" ry="3.2" fill="var(--jet-glass)"/>`
        : `<rect x="${wx - 2}" y="${wy - 3}" width="4" height="6" rx="1.6" fill="var(--jet-glass)"/>`);
    }
    // cockpit
    g.push(`<path d="M${P(-H + 0.035 * L, -w * 0.32)} L${P(-H + 0.085 * L, -w * 0.44)} L${P(-H + 0.095 * L, w * 0.3)} L${P(-H + 0.04 * L, w * 0.24)} Z" fill="var(--jet-glass)"/>`);

    // centre engine (trijet) and near engine
    if (jet.art.tri) g.push(`<path d="${path([[0.3 * L, -w * 0.18, w * 0.5], [0.42 * L, -w * 0.18, w * 0.5], [0.42 * L, w * 0.18, w * 0.5], [0.3 * L, w * 0.18, w * 0.5]])}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1"/>`);
    g.push(`<path d="${path(eng(1).map((p) => [p[0], p[1], w * 0.3]))}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1"/>`);
    const intake = P(0.24 * L, w * 0.66, w * 0.3);
    g.push(`<ellipse cx="${intake[0]}" cy="${intake[1]}" rx="3.2" ry="${f(w * 0.3)}" fill="var(--jet-glass)" opacity=".75"/>`);

    // fin
    const b1 = P(0.33 * L, 0, w * 0.35), b2 = P(0.49 * L, 0, w * 0.25);
    const t1 = P(0.44 * L, 0, finH), t2 = P(0.5 * L, 0, finH);
    g.push(`<path d="M${b1} L${t1} L${t2} L${b2} Z" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1" stroke-linejoin="round"/>`);
    // horizontal stabiliser (T-tail on top of fin; mid-mounted for the trijet)
    const sz = jet.art.tri ? finH * 0.35 : finH;
    g.push(`<path d="${path([[0.42 * L, 0, sz], [0.49 * L, -0.13 * L, sz], [0.53 * L, -0.13 * L, sz], [0.52 * L, 0, sz], [0.53 * L, 0.13 * L, sz], [0.49 * L, 0.13 * L, sz]])}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1" stroke-linejoin="round"/>`);

    // near wing (+y) with winglet
    g.push(`<path d="${path(wing(1))}" fill="url(#${id}w)" stroke="var(--jet-line)" stroke-width="1.1" stroke-linejoin="round"/>`);
    const nwt = P(0.2 * L, 0.36 * L), nwt2 = P(0.25 * L, 0.36 * L);
    g.push(`<path d="M${nwt[0]},${nwt[1]} L${nwt[0] + 6},${nwt[1] - 14} L${nwt2[0] + 5},${nwt2[1] - 14} L${nwt2[0]},${nwt2[1]} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width=".8"/>`);

    return `<svg viewBox="0 0 640 260" role="img" aria-label="${Util.esc(jet.maker + ' ' + jet.model)}">${g.join('')}</svg>`;
  }

  function winCount(jet) {
    const n = jet.windows ? jet.windows / 2 : (jet.cabin.l / 12) / 2.3;
    return Math.max(4, Math.min(16, Math.round(n)));
  }

  /* ---------- side view ---------- */
  /* opts: { gear, door, zones:[[a,b]], hl:index, cutaway:boolean, hotspots:boolean, zoneKinds:[[kind...]] } */
  function side(jet, opts = {}) {
    const id = 'j' + (++uid);
    const L = jet.art.len;
    const x0 = (640 - L) / 2 + 10;
    const xe = x0 + L;
    const nose = 72;
    const xt = xe - 120;
    const top = 72, bot = 124, mid = (top + bot) / 2;
    const cab0 = x0 + nose + 38, cab1 = xt - 6;
    const n = winCount(jet);
    const xm = x0 + L * 0.44;
    const g = [];
    const zx = (fr) => cab0 - 30 + (cab1 - cab0 + 30) * fr;

    g.push(`<defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--jet-body)"/><stop offset=".62" stop-color="var(--jet-body)"/><stop offset="1" stop-color="var(--jet-shade)"/>
      </linearGradient>
      <clipPath id="${id}c"><path d="${fuselage()}"/></clipPath>
    </defs>`);

    g.push(`<ellipse cx="${(x0 + xe) / 2}" cy="${opts.gear ? 188 : 178}" rx="${L * 0.42}" ry="7" fill="var(--ink)" opacity="${opts.gear ? .09 : .05}"/>`);
    g.push(`<path d="M${xm - 30},${bot - 8} L${xm + 64},${bot - 10} L${xm + 112},${bot - 30} L${xm + 96},${bot - 30} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    const tailTop = jet.art.tri ? 26 : 20;
    g.push(`<path d="M${xe - 86},${top + 4} C${xe - 60},${top - 10} ${xe - 46},${tailTop + 18} ${xe - 34},${tailTop} L${xe - 8},${tailTop} L${xe - 2},${top + 14} Z" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.1"/>`);
    if (jet.art.tri) g.push(`<path d="M${xe - 70},${top - 2} L${xe + 14},${top - 8} L${xe + 16},${top - 3} L${xe - 64},${top + 3} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);
    else g.push(`<path d="M${xe - 52},${tailTop + 1} L${xe + 22},${tailTop - 5} L${xe + 24},${tailTop} L${xe - 44},${tailTop + 6} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    g.push(`<path d="${fuselage()}" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.2"/>`);
    // gold trim lines
    g.push(`<path clip-path="url(#${id}c)" d="M${x0},${mid + 10} C${x0 + L * 0.4},${mid + 6} ${x0 + L * 0.7},${mid + 2} ${xe},${mid - 6}" stroke="var(--trim)" stroke-width="1.6" fill="none"/>`);
    g.push(`<path clip-path="url(#${id}c)" d="M${x0 + 40},${mid + 16} C${x0 + L * 0.45},${mid + 12} ${x0 + L * 0.75},${mid + 8} ${xe},${mid}" stroke="var(--trim)" stroke-width=".9" fill="none" opacity=".7"/>`);

    g.push(`<path d="M${x0 + 34},${top + 16} C${x0 + 44},${top + 8} ${x0 + 56},${top + 4} ${x0 + 70},${top + 3} L${x0 + 72},${top + 13} L${x0 + 40},${top + 19} Z" fill="var(--jet-glass)"/>`);

    const span = cab1 - cab0;
    const winX = [];
    for (let i = 0; i < n; i++) winX.push(cab0 + 22 + (span - 30) * (i / Math.max(1, n - 1)));
    const hasCut = opts.cutaway && opts.zones && opts.zones[opts.hl];
    const [ca, cb] = hasCut ? [zx(opts.zones[opts.hl][0]) + 2, zx(opts.zones[opts.hl][1]) - 2] : [0, 0];
    for (const cx of winX) {
      if (hasCut && cx > ca - 6 && cx < cb + 6) continue;
      if (jet.art.win === 'oval') g.push(`<ellipse cx="${cx}" cy="${mid - 4}" rx="6.5" ry="8.5" fill="var(--jet-glass)"/>`);
      else g.push(`<rect x="${cx - 5}" y="${mid - 12}" width="10" height="14" rx="4.5" fill="var(--jet-glass)"/>`);
    }

    // cutaway: the active section opened up to show its furniture
    if (hasCut) {
      const cw = Math.max(54, cb - ca);
      const ct = top - 12, ch = bot - top + 20;
      g.push(`<g class="cut"><rect x="${ca}" y="${ct}" width="${cw}" height="${ch}" rx="12" fill="var(--cut-wall)" stroke="var(--jet-line)" stroke-width="1.6"/>`);
      g.push(`<rect x="${ca + 4}" y="${ct + 4}" width="${cw - 8}" height="${ch - 8}" rx="9" fill="var(--cut-in)"/>`);
      const wn = Math.max(1, Math.floor((cw - 12) / 22));
      for (let i = 0; i < wn; i++) g.push(`<rect x="${ca + 10 + i * ((cw - 20) / wn) + ((cw - 20) / wn) / 2 - 5}" y="${ct + 12}" width="10" height="15" rx="4.5" fill="var(--cut-win)"/>`);
      g.push(`<rect x="${ca + 4}" y="${bot - 8}" width="${cw - 8}" height="6" rx="3" fill="var(--cut-floor)"/>`);
      g.push(furniture(opts.zoneKinds ? opts.zoneKinds[opts.hl] : [], ca + 8, bot - 8, cw - 16));
      g.push('</g>');
    }

    const dx = x0 + nose + 8;
    if (opts.door) {
      g.push(`<rect x="${dx}" y="${top + 6}" width="20" height="${bot - top - 8}" rx="4" fill="var(--jet-glass)"/>`);
      const sx = dx, sy = bot - 2, ex = dx - 46, ey = 184;
      g.push(`<path d="M${sx},${sy} L${ex},${ey} M${sx + 20},${sy} L${ex + 20},${ey}" stroke="var(--jet-line)" stroke-width="1.8"/>`);
      for (let s = 1; s <= 6; s++) {
        const fr = s / 7, x = sx + (ex - sx) * fr, y = sy + (ey - sy) * fr;
        g.push(`<line x1="${x}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="var(--jet-line)" stroke-width="2.2"/>`);
      }
      g.push(`<path d="M${sx - 2},${sy - 22} L${ex - 2},${ey - 24}" stroke="var(--jet-line)" stroke-width="1.2" fill="none"/>`);
    } else {
      g.push(`<rect x="${dx}" y="${top + 8}" width="18" height="${bot - top - 14}" rx="5" fill="none" stroke="var(--jet-line)" stroke-width="1"/>`);
    }

    const ex0 = xt - 58;
    g.push(`<path d="M${ex0 + 34},${top + 14} L${ex0 + 58},${top + 6}" stroke="var(--jet-line)" stroke-width="5" stroke-linecap="round"/>`);
    g.push(`<rect x="${ex0}" y="${top - 18}" width="${jet.art.len > 500 ? 92 : 78}" height="26" rx="13" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.1"/>`);
    g.push(`<rect x="${ex0}" y="${top - 18}" width="14" height="26" rx="7" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);
    if (jet.art.tri) g.push(`<path d="M${xe - 100},${top + 2} C${xe - 96},${top - 12} ${xe - 80},${top - 14} ${xe - 66},${top - 10} L${xe - 64},${top + 4} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    g.push(`<path d="M${xm - 44},${bot - 4} L${xm + 74},${bot - 2} L${xm + 150},${bot + 16} L${xm + 136},${bot + 20} L${xm + 40},${bot + 12} L${xm - 30},${bot + 8} Z" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.1"/>`);
    g.push(`<path d="M${xm + 146},${bot + 17} L${xm + 154},${bot - 4} L${xm + 158},${bot - 4} L${xm + 151},${bot + 18} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    if (opts.gear) {
      const ng = x0 + 52, mg = xm + 54;
      g.push(`<path d="M${ng},${bot - 4} L${ng},${172}" stroke="var(--jet-line)" stroke-width="3.5"/><circle cx="${ng}" cy="177" r="8" fill="var(--ink-2)"/><circle cx="${ng}" cy="177" r="3" fill="var(--jet-shade)"/>`);
      g.push(`<path d="M${mg},${bot + 10} L${mg + 4},${170}" stroke="var(--jet-line)" stroke-width="4.5"/><circle cx="${mg + 4}" cy="176" r="10" fill="var(--ink-2)"/><circle cx="${mg + 4}" cy="176" r="3.6" fill="var(--jet-shade)"/>`);
    }

    // "+" hotspots on the other sections
    if (opts.hotspots && opts.zones) {
      opts.zones.forEach(([a, b], i) => {
        if (i === opts.hl) return;
        const hx = (zx(a) + zx(b)) / 2;
        g.push(`<g class="hot" data-act="zone" data-id="${jet.id}" data-v="${i}" role="button" tabindex="0" aria-label="${Util.esc(t('Section'))} ${i + 1}">
          <circle cx="${hx}" cy="${mid + 2}" r="24" fill="transparent"/>
          <circle cx="${hx}" cy="${mid + 2}" r="11" fill="var(--glass-strong)" stroke="var(--jet-line)" stroke-width=".8"/>
          <path d="M${hx - 4.5},${mid + 2} h9 M${hx},${mid - 2.5} v9" stroke="var(--ink)" stroke-width="1.2" stroke-linecap="round"/></g>`);
      });
    }

    return `<svg viewBox="0 0 640 ${opts.gear ? 200 : 190}" role="img" aria-label="${Util.esc(jet.maker + ' ' + jet.model)}">${g.join('')}</svg>`;

    function fuselage() {
      return `M${x0},${mid + 4}
        C${x0},${top + 18} ${x0 + 26},${top} ${x0 + nose},${top}
        L${xt},${top}
        C${xt + 70},${top} ${xe - 26},${top + 6} ${xe},${top + 12}
        L${xe},${top + 22}
        C${xe - 50},${top + 32} ${xt + 50},${bot} ${xt},${bot}
        L${x0 + 56},${bot}
        C${x0 + 20},${bot} ${x0},${mid + 18} ${x0},${mid + 4} Z`;
    }
  }

  /* Side-view furniture for the cutaway, from the section's seat kinds. */
  function furniture(kinds, x, floor, width) {
    const items = [];
    const seat = (sx, flip) => `<g transform="translate(${sx},${floor}) scale(${flip ? -1 : 1},1)"><path d="M-7,-2 h14 v-8 h-14z M-7,-10 l-3,-20 a3 3 0 0 1 3,-3 h2 l3,22z" fill="var(--seat-fill)" stroke="var(--seat-line)" stroke-width=".8"/></g>`;
    const sofa = (sx, w) => `<path d="M${sx},${floor - 2} h${w} v-10 h-${w}z M${sx},${floor - 12} v-12 h${w} v12z" fill="var(--seat-fill)" stroke="var(--seat-line)" stroke-width=".8"/>`;
    const table = (sx) => `<path d="M${sx - 9},${floor - 18} h18 M${sx},${floor - 18} v16" stroke="var(--seat-line)" stroke-width="1.6"/>`;
    const bed = (sx, w) => `<path d="M${sx},${floor - 2} h${w} v-12 h-${w}z" fill="var(--seat-fill)" stroke="var(--seat-line)" stroke-width=".8"/><rect x="${sx + 3}" y="${floor - 20}" width="14" height="7" rx="3" fill="var(--surface-2)" stroke="var(--seat-line)" stroke-width=".6"/>`;
    const has = (k) => kinds.includes(k);
    if (has('bed')) items.push(bed(x + 6, Math.min(70, width - 12)));
    else if (has('divan')) items.push(sofa(x + 6, Math.min(64, width - 12)));
    if (has('dining')) { const c = x + width / 2; items.push(seat(c - 20, false), table(c), seat(c + 20, true)); }
    else if (has('recliner') || has('side') || has('lav')) {
      const c = x + width / 2;
      if (has('divan') || has('bed')) items.push(seat(x + width - 12, true));
      else items.push(seat(c - 18, false), table(c), seat(c + 18, true));
    }
    if (!items.length) items.push(`<rect x="${x + 6}" y="${floor - 30}" width="${Math.min(40, width - 12)}" height="28" rx="4" fill="url(#hatch)" stroke="var(--seat-line)" stroke-width=".6"/>`);
    return `<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--hatch-bg)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch)" stroke-width="2.4"/></pattern></defs>${items.join('')}`;
  }

  /* Cabin cross-section, drawn to scale from width and height. */
  function cross(jet) {
    const s = 0.7, w = jet.cabin.w * s, h = jet.cabin.h * s;
    const cx = 50, cy = 52;
    const rx = w / 2 + 6, ry = h / 2 + 8;
    const person = Math.min(70 * s, h - 6);
    return `<svg viewBox="0 0 100 100" role="img" aria-label="${Util.esc(t('Cabin cross-section'))}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="var(--jet-body)" stroke="var(--jet-line)" stroke-width="1.1"/>
      <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="var(--surface)" stroke="var(--jet-line)" stroke-dasharray="2 2" stroke-width=".7"/>
      <line x1="${cx - w / 2}" y1="${cy + h / 2}" x2="${cx + w / 2}" y2="${cy + h / 2}" stroke="var(--ink-2)" stroke-width="1"/>
      <g fill="var(--sky)"><circle cx="${cx}" cy="${cy + h / 2 - person + 4}" r="4"/><rect x="${cx - 4}" y="${cy + h / 2 - person + 9}" width="8" height="${person - 9}" rx="3"/></g>
    </svg>`;
  }

  return { plan, side, cross, winCount };
})();
