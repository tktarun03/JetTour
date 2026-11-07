/* Original side-view business-jet drawing, built from each aircraft's proportions.
   Not a reproduction of any manufacturer artwork. */
const JetArt = (() => {
  let uid = 0;

  /* opts: { gear:boolean, door:boolean, tilt:number, zones:[[a,b]...] fractions of cabin, hl:index } */
  function side(jet, opts = {}) {
    const id = 'j' + (++uid);
    const L = jet.art.len;
    const x0 = (640 - L) / 2 + 10;
    const xe = x0 + L;
    const nose = 72;
    const xt = xe - 120;           // tail cone start
    const top = 72, bot = 124, mid = (top + bot) / 2;
    const cab0 = x0 + nose + 38, cab1 = xt - 6;
    const n = jet.windows ? Math.min(jet.windows / (jet.windowsNote === 'up to' ? 2 : 2), 16) : Math.round((jet.cabin.l / 12) / 2.3);
    const winCount = Math.max(4, Math.round(n));
    const xm = x0 + L * 0.44;
    const g = [];

    g.push(`<defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--jet-body)"/><stop offset=".62" stop-color="var(--jet-body)"/><stop offset="1" stop-color="var(--jet-shade)"/>
      </linearGradient>
      <clipPath id="${id}c"><path d="${fuselage()}"/></clipPath>
    </defs>`);

    // shadow
    g.push(`<ellipse cx="${(x0 + xe) / 2}" cy="${opts.gear ? 186 : 178}" rx="${L * 0.42}" ry="7" fill="var(--ink)" opacity="${opts.gear ? .10 : .06}"/>`);

    // far wing (behind fuselage)
    g.push(`<path d="M${xm - 30},${bot - 8} L${xm + 64},${bot - 10} L${xm + 112},${bot - 30} L${xm + 96},${bot - 30} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    // tail fin
    const tailTop = jet.art.tri ? 26 : 20;
    g.push(`<path d="M${xe - 86},${top + 4} C${xe - 60},${top - 10} ${xe - 46},${tailTop + 18} ${xe - 34},${tailTop} L${xe - 8},${tailTop} L${xe - 2},${top + 14} Z" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.2"/>`);
    // horizontal stabiliser: T-tail, or mid-mounted for the trijet
    if (jet.art.tri) g.push(`<path d="M${xe - 70},${top - 2} L${xe + 14},${top - 8} L${xe + 16},${top - 3} L${xe - 64},${top + 3} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);
    else g.push(`<path d="M${xe - 52},${tailTop + 1} L${xe + 22},${tailTop - 5} L${xe + 24},${tailTop} L${xe - 44},${tailTop + 6} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    // fuselage
    g.push(`<path d="${fuselage()}" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.3"/>`);

    // zone highlight inside fuselage
    if (opts.zones && opts.hl != null && opts.zones[opts.hl]) {
      const [a, b] = opts.zones[opts.hl];
      const za = cab0 - 30 + (cab1 - cab0 + 30) * a, zb = cab0 - 30 + (cab1 - cab0 + 30) * b;
      g.push(`<rect clip-path="url(#${id}c)" x="${za}" y="${top - 2}" width="${Math.max(6, zb - za)}" height="${bot - top + 4}" fill="var(--sky)" opacity=".55"/>`);
      g.push(`<line x1="${za}" y1="${top}" x2="${za}" y2="${bot}" stroke="var(--sky-deep)" stroke-width="1" clip-path="url(#${id}c)"/><line x1="${zb}" y1="${top}" x2="${zb}" y2="${bot}" stroke="var(--sky-deep)" stroke-width="1" clip-path="url(#${id}c)"/>`);
    }

    // cheatline
    g.push(`<path clip-path="url(#${id}c)" d="M${x0},${mid + 12} L${xe},${mid + 4}" stroke="var(--sky-deep)" stroke-width="3" opacity=".75"/>`);

    // cockpit glass
    g.push(`<path d="M${x0 + 34},${top + 16} C${x0 + 44},${top + 8} ${x0 + 56},${top + 4} ${x0 + 70},${top + 3} L${x0 + 72},${top + 13} L${x0 + 40},${top + 19} Z" fill="var(--jet-glass)"/>`);

    // cabin windows
    const span = cab1 - cab0;
    for (let i = 0; i < winCount; i++) {
      const cx = cab0 + 22 + (span - 30) * (i / Math.max(1, winCount - 1));
      if (jet.art.win === 'oval') g.push(`<ellipse cx="${cx}" cy="${mid - 4}" rx="6.5" ry="8.5" fill="var(--jet-glass)"/>`);
      else g.push(`<rect x="${cx - 5}" y="${mid - 12}" width="10" height="14" rx="4.5" fill="var(--jet-glass)"/>`);
    }

    // door
    const dx = x0 + nose + 8;
    if (opts.door) {
      g.push(`<rect x="${dx}" y="${top + 6}" width="20" height="${bot - top - 8}" rx="4" fill="var(--jet-glass)"/>`);
      g.push(`<rect x="${dx + 3}" y="${top + 10}" width="14" height="${bot - top - 16}" rx="3" fill="var(--ink-2)" opacity=".5"/>`);
      // airstair down to the ground
      const sx = dx, sy = bot - 2, ex = dx - 46, ey = 182;
      g.push(`<path d="M${sx},${sy} L${ex},${ey} M${sx + 20},${sy} L${ex + 20},${ey}" stroke="var(--jet-line)" stroke-width="2"/>`);
      for (let s = 1; s <= 6; s++) {
        const f = s / 7, x = sx + (ex - sx) * f, y = sy + (ey - sy) * f;
        g.push(`<line x1="${x}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="var(--jet-line)" stroke-width="2.4"/>`);
      }
      g.push(`<path d="M${sx - 2},${sy - 22} L${ex - 2},${ey - 24}" stroke="var(--jet-line)" stroke-width="1.4" fill="none"/>`);
    } else {
      g.push(`<rect x="${dx}" y="${top + 8}" width="18" height="${bot - top - 14}" rx="5" fill="none" stroke="var(--jet-line)" stroke-width="1"/>`);
    }

    // engines (rear-mounted nacelles) + third engine for the trijet
    const ex0 = xt - 58;
    g.push(`<path d="M${ex0 + 34},${top + 14} L${ex0 + 58},${top + 6}" stroke="var(--jet-line)" stroke-width="5" stroke-linecap="round"/>`);
    g.push(`<rect x="${ex0}" y="${top - 18}" width="${jet.art.len > 500 ? 92 : 78}" height="26" rx="13" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.2"/>`);
    g.push(`<rect x="${ex0}" y="${top - 18}" width="14" height="26" rx="7" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);
    if (jet.art.tri) g.push(`<path d="M${xe - 100},${top + 2} C${xe - 96},${top - 12} ${xe - 80},${top - 14} ${xe - 66},${top - 10} L${xe - 64},${top + 4} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    // near wing
    g.push(`<path d="M${xm - 44},${bot - 4} L${xm + 74},${bot - 2} L${xm + 150},${bot + 16} L${xm + 136},${bot + 20} L${xm + 40},${bot + 12} L${xm - 30},${bot + 8} Z" fill="url(#${id}b)" stroke="var(--jet-line)" stroke-width="1.2"/>`);
    g.push(`<path d="M${xm + 146},${bot + 17} L${xm + 154},${bot - 4} L${xm + 158},${bot - 4} L${xm + 151},${bot + 18} Z" fill="var(--jet-shade)" stroke="var(--jet-line)" stroke-width="1"/>`);

    // landing gear
    if (opts.gear) {
      const ng = x0 + 52, mg = xm + 54;
      g.push(`<path d="M${ng},${bot - 4} L${ng},${172}" stroke="var(--jet-line)" stroke-width="4"/><circle cx="${ng}" cy="176" r="8" fill="var(--ink-2)"/><circle cx="${ng}" cy="176" r="3" fill="var(--jet-shade)"/>`);
      g.push(`<path d="M${mg},${bot + 10} L${mg + 4},${170}" stroke="var(--jet-line)" stroke-width="5"/><circle cx="${mg + 4}" cy="175" r="10" fill="var(--ink-2)"/><circle cx="${mg + 4}" cy="175" r="3.6" fill="var(--jet-shade)"/>`);
    }

    const tilt = opts.tilt ? ` transform="rotate(${opts.tilt} 320 110)"` : '';
    return `<svg viewBox="0 0 640 ${opts.gear ? 200 : 190}" role="img" aria-label="${Util.esc(jet.maker + ' ' + jet.model)}"><g${tilt}>${g.join('')}</g></svg>`;

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

  /* Cabin cross-section, drawn to scale from width and height. */
  function cross(jet) {
    const s = 0.7, w = jet.cabin.w * s, h = jet.cabin.h * s;
    const cx = 50, cy = 52;
    const rx = w / 2 + 6, ry = h / 2 + 8;
    const person = Math.min(70 * s, h - 6); // a 70 in (5 ft 10) person
    return `<svg viewBox="0 0 100 100" role="img" aria-label="${Util.esc(t('Cabin cross-section'))}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="var(--jet-body)" stroke="var(--jet-line)" stroke-width="1.4"/>
      <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="var(--surface)" stroke="var(--jet-line)" stroke-dasharray="2 2" stroke-width=".8"/>
      <line x1="${cx - w / 2}" y1="${cy + h / 2}" x2="${cx + w / 2}" y2="${cy + h / 2}" stroke="var(--ink-2)" stroke-width="1.4"/>
      <g fill="var(--sky-deep)"><circle cx="${cx}" cy="${cy + h / 2 - person + 4}" r="4"/><rect x="${cx - 4}" y="${cy + h / 2 - person + 9}" width="8" height="${person - 9}" rx="3"/></g>
    </svg>`;
  }

  return { side, cross };
})();
