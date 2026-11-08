/* Horizontal cabin floorplan (nose on the left), built from jet.layout.zones rows (see js/data/fleet.js).
   Row sides: L = upper band, R = lower band, F = full width. */
const Floorplan = (() => {
  const U = 30;                    // px per layout unit along the cabin
  const Y0 = 44, Y1 = 196;         // cabin band (across)
  const AISLE = 34;
  const SW = (Y1 - Y0 - AISLE) / 2;
  const NOSE = 24, TAIL = 24, GAP = 8, ZGAP = 22;
  const LEN = { pair: 3, single: 1.35, side: 1.25, divan2: 2, divan3: 2.8, dine3: 3, bed: 3.6, door: 1.4, galley: 1.6,
    lav: 2, lavb: 2, wardrobe: 1.3, crew: 1.8, tv: 1.1, credenza: 1.4, ensuite: 2.6, empty: 1 };
  const SEAT_KINDS = {
    recliner: { name: 'Recliner' },
    side: { name: 'Side-facing seat' },
    divan: { name: 'Divan' },
    dining: { name: 'Dining chair' },
    lav: { name: 'Belted lavatory seat' },
    bed: { name: 'Suite bed' },
  };
  const cache = {};

  function build(jet) {
    if (cache[jet.id]) return cache[jet.id];
    const g = [];
    const seats = [];
    const spans = [];
    const labels = [];
    let x = NOSE;

    jet.layout.zones.forEach((z, zi) => {
      let letter = 0;
      const zStart = x;
      const nextId = (kind, box) => {
        const id = `${zi + 1}${String.fromCharCode(65 + letter++)}`;
        seats.push({ id, kind, zone: zi, box });
        return id;
      };
      for (const row of z.rows) {
        const len = (row.F ? LEN[row.F] : Math.max(LEN[row.L] || 0, LEN[row.R] || 0)) * U;
        if (row.F) full(row.F, x, len, nextId);
        else { if (row.L) side(row.L, 'L', x, len, nextId); if (row.R) side(row.R, 'R', x, len, nextId); }
        x += len + GAP;
      }
      spans.push([zStart, x - GAP]);
      x += ZGAP;
    });
    const W = x - ZGAP + TAIL;
    const H = Y1 + 14;

    // section labels and dividers (like the reference: label above each section, thin rule between)
    spans.forEach(([a, b], i) => {
      const name = t(jet.layout.zones[i].name);
      const fits = name.length * 5.6 < (b - a) + ZGAP - 6;
      labels.push(`<text class="fp-label" x="${a}" y="24">${fits ? Util.esc(name) : i + 1}</text>`);
      if (i > 0) labels.push(`<line class="fp-div" x1="${a - ZGAP / 2}" y1="12" x2="${a - ZGAP / 2}" y2="${H - 6}"/>`);
      labels.push(`<rect class="fp-zone-hl" data-zone="${i}" x="${a - 8}" y="${Y0 - 8}" width="${b - a + 16}" height="${Y1 - Y0 + 16}" rx="14" opacity="0"/>`);
    });
    const walls = `<line class="fp-wall" x1="${NOSE - 10}" y1="${Y0 - 3}" x2="${W - TAIL + 10}" y2="${Y0 - 3}"/><line class="fp-wall" x1="${NOSE - 10}" y1="${Y1 + 3}" x2="${W - TAIL + 10}" y2="${Y1 + 3}"/>`;
    const defs = `<defs><pattern id="fp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="var(--hatch-bg)"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--hatch)" stroke-width="3"/></pattern></defs>`;

    const first = spans[0][0], total = spans[spans.length - 1][1] - first;
    const zoneFrac = spans.map(([a, b]) => [(a - first) / total, (b - first) / total]);
    const inner = defs + labels.join('') + walls + g.join('');
    const out = {
      width: W, height: H, spans,
      svg: (sel, mine, hl) => {
        let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${Util.esc(t('Cabin floorplan, nose on the left'))}">${inner}`;
        if (sel) { const st = seats.find((q) => q.id === sel); if (st) s += selMark(st.box); }
        s += '</svg>';
        s = s.replace(/data-seat="([^"]+)" class="fp-seat"/g, (m, id) => `data-seat="${id}" class="fp-seat${id === sel ? ' sel' : ''}${id === mine ? ' mine' : ''}"`);
        if (hl != null) s = s.replace(`data-zone="${hl}" `, `data-zone="${hl}" style="opacity:1" `);
        return s;
      },
      seats,
      count: seats.filter((q) => q.kind !== 'bed').length,
      zoneFrac,
    };
    cache[jet.id] = out;
    return out;

    /* ---- helpers ---- */
    function bandY(s) { return s === 'L' ? Y0 : Y1 - SW; }
    function seatG(id, kind, innerSvg) {
      const label = `${t('Seat')} ${id}, ${t(SEAT_KINDS[kind].name)}`;
      return `<g data-seat="${id}" class="fp-seat" tabindex="0" role="button" aria-label="${Util.esc(label)}">${innerSvg}</g>`;
    }
    // facing: 'fwd' toward the nose (back on the right), 'aft' (back on the left), 'down'/'up' side-facing
    function chair(cx, cy, w, h, facing) {
      let back = '', arms = '';
      if (facing === 'fwd') { back = `<rect class="back" x="${cx + w - 8}" y="${cy + 1}" width="8" height="${h - 2}" rx="4"/>`; arms = `<rect class="arm" x="${cx + 3}" y="${cy - 1}" width="${w - 10}" height="4" rx="2"/><rect class="arm" x="${cx + 3}" y="${cy + h - 3}" width="${w - 10}" height="4" rx="2"/>`; }
      if (facing === 'aft') { back = `<rect class="back" x="${cx}" y="${cy + 1}" width="8" height="${h - 2}" rx="4"/>`; arms = `<rect class="arm" x="${cx + 7}" y="${cy - 1}" width="${w - 10}" height="4" rx="2"/><rect class="arm" x="${cx + 7}" y="${cy + h - 3}" width="${w - 10}" height="4" rx="2"/>`; }
      if (facing === 'down') back = `<rect class="back" x="${cx + 1}" y="${cy}" width="${w - 2}" height="8" rx="4"/>`;
      if (facing === 'up') back = `<rect class="back" x="${cx + 1}" y="${cy + h - 8}" width="${w - 2}" height="8" rx="4"/>`;
      return `<rect class="cush" x="${cx}" y="${cy}" width="${w}" height="${h}" rx="7"/>${back}${arms}`;
    }
    function fixture(fx, fy, w, h, label) {
      return `<rect class="fp-fix" x="${fx}" y="${fy}" width="${w}" height="${h}" rx="8"/>` +
        (label ? `<text class="fp-fix-t" x="${fx + w / 2}" y="${fy + h + 12}" text-anchor="middle">${Util.esc(t(label))}</text>` : '');
    }

    function side(mod, s, x0, rowLen, nextId) {
      const y = bandY(s);
      const len = LEN[mod] * U;
      const cs = SW - 12;            // chair size across
      const cy = s === 'L' ? y + 2 : y + 10;
      switch (mod) {
        case 'pair': {
          const cw = U * 1.1;
          const b1 = [x0, cy, cw, cs], b2 = [x0 + len - cw, cy, cw, cs];
          g.push(seatG(nextId('recliner', b1), 'recliner', chair(...b1, 'aft')));
          g.push(`<rect class="fp-table" x="${x0 + cw + 5}" y="${cy + 8}" width="${len - 2 * cw - 10}" height="${cs - 16}" rx="5"/>`);
          g.push(seatG(nextId('recliner', b2), 'recliner', chair(...b2, 'fwd')));
          break;
        }
        case 'single': { const b = [x0 + 2, cy, U * 1.1, cs]; g.push(seatG(nextId('recliner', b), 'recliner', chair(...b, 'fwd'))); break; }
        case 'side': {
          const b = [x0 + 2, s === 'L' ? y : y + SW - U * 1.15, U * 1.1, U * 1.15];
          g.push(seatG(nextId('side', b), 'side', chair(...b, s === 'L' ? 'down' : 'up')));
          break;
        }
        case 'divan2': case 'divan3': {
          const nPl = mod === 'divan3' ? 3 : 2;
          const bh = U * 0.95;
          const by = s === 'L' ? y : y + SW - bh;
          const pl = (len - 4) / nPl;
          g.push(`<rect class="fp-divan-end" x="${x0 - 2}" y="${by}" width="6" height="${bh}" rx="3"/><rect class="fp-divan-end" x="${x0 + len - 6}" y="${by}" width="6" height="${bh}" rx="3"/>`);
          for (let i = 0; i < nPl; i++) { const b = [x0 + 2 + i * pl, by, pl, bh]; g.push(seatG(nextId('divan', b), 'divan', chair(b[0], b[1], b[2] - 1, b[3], s === 'L' ? 'down' : 'up'))); }
          break;
        }
        case 'dine3': {
          const tw = len - U * 2.1, th = U * 0.95;
          const ty = s === 'L' ? y : y + SW - th;
          const tx = x0 + U * 1.05;
          const b1 = [x0, ty, U * 0.95, th];
          g.push(seatG(nextId('dining', b1), 'dining', chair(...b1, 'aft')));
          g.push(`<rect class="fp-table" x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="6"/>`);
          const b2 = [tx + tw / 2 - U * 0.5, s === 'L' ? ty + th + 4 : ty - U - 4, U, U];
          g.push(seatG(nextId('dining', b2), 'dining', chair(...b2, s === 'L' ? 'up' : 'down')));
          const b3 = [x0 + len - U * 0.95, ty, U * 0.95, th];
          g.push(seatG(nextId('dining', b3), 'dining', chair(...b3, 'fwd')));
          break;
        }
        case 'bed': {
          const bh = SW + 8, by = s === 'L' ? y : y + SW - bh;
          const b = [x0, by, len, bh];
          g.push(seatG(nextId('bed', b), 'bed', `<rect class="cush" x="${x0}" y="${by}" width="${len}" height="${bh}" rx="10"/>` +
            `<rect class="back" x="${x0 + 6}" y="${by + 6}" width="14" height="${bh / 2 - 9}" rx="6"/><rect class="back" x="${x0 + 6}" y="${by + bh / 2 + 3}" width="14" height="${bh / 2 - 9}" rx="6"/>`));
          break;
        }
        case 'door': {
          const wy = s === 'L' ? Y0 - 9 : Y1 + 3;
          g.push(`<rect x="${x0 + 6}" y="${wy}" width="${len - 12}" height="6" rx="3" fill="var(--sky)"/>`);
          g.push(`<text class="fp-fix-t" x="${x0 + len / 2}" y="${s === 'L' ? y + 18 : y + SW - 8}" text-anchor="middle">${Util.esc(t('Door'))}</text>`);
          break;
        }
        case 'galley': g.push(fixture(x0, y + 2, len - 2, SW - 18, 'Galley')); break;
        case 'lav': g.push(fixture(x0, y + 2, len - 2, SW - 18, 'Lav')); break;
        case 'wardrobe': g.push(fixture(x0, y + 2, len - 2, SW - 18, 'Closet')); break;
        case 'crew': g.push(fixture(x0, y + 2, len - 2, SW - 18, 'Crew')); break;
        case 'tv': g.push(fixture(x0 + len / 2 - 5, s === 'L' ? y : y + SW - 12, 10, 12, '')); break;
        case 'credenza': g.push(fixture(x0, y + 2, len - 2, 16, '')); break;
        default: break;
      }
    }

    function full(mod, x0, len, nextId) {
      if (mod === 'galley') { g.push(fixture(x0, Y0, len - 2, SW - 16, 'Galley')); g.push(fixture(x0, Y1 - SW + 16, len - 2, SW - 16, '')); return; }
      const label = mod === 'ensuite' ? 'En suite' : 'Lavatory';
      g.push(`<rect class="fp-fix" x="${x0}" y="${Y0}" width="${len - 2}" height="${Y1 - Y0}" rx="12"/>`);
      g.push(`<rect x="${x0 - 2}" y="${(Y0 + Y1) / 2 - 15}" width="6" height="30" fill="var(--surface-2)"/>`);
      g.push(`<text class="fp-fix-t" x="${x0 + len / 2}" y="${Y0 + 16}" text-anchor="middle">${Util.esc(t(label))}</text>`);
      if (mod === 'lavb') { const b = [x0 + len / 2 - 14, (Y0 + Y1) / 2 - 14, 28, 28]; g.push(seatG(nextId('lav', b), 'lav', chair(...b, 'fwd'))); }
    }
  }

  function selMark(box) {
    const [x, y, w, h] = box;
    return `<rect class="fp-sel-ring" x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" rx="11"/>` +
      `<g class="fp-x"><circle cx="${x + w + 5}" cy="${y - 5}" r="8"/><path d="M${x + w + 2},${y - 8} l6,6 M${x + w + 8},${y - 8} l-6,6"/></g>`;
  }

  function seatInfo(jet, kind) {
    const tall = jet.cabin.h >= 70;
    const D = {
      recliner: jet.berth && tall
        ? t('Swivels, tracks and reclines. Facing pairs line up to make a flat bed.')
        : t('Swivels, tracks and reclines. The {h} cabin is too low for full beds.', { h: Util.ftIn(jet.cabin.h) }),
      side: t('Single side-facing seat by the door. Handy for short legs.'),
      divan: t('Side-facing sofa, belted for takeoff and landing. Folds flat into a berth.'),
      dining: t('Sits at the conference table for meals and meetings. Belted for takeoff and landing.'),
      lav: t('Certified overflow seat in the lavatory. Charter operators rarely sell it.'),
      bed: t('Fixed bed in the private suite. Usually not certified for takeoff and landing, so it is not counted as a seat.'),
    };
    return { name: t(SEAT_KINDS[kind].name), desc: D[kind], icon: kind };
  }

  /* 3/4-view seat illustrations for the seat cards. */
  function icon(kind) {
    const D = `<defs>
      <linearGradient id="lthr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--leather-2)"/><stop offset="1" stop-color="var(--leather)"/></linearGradient>
      <linearGradient id="chrm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--chrome-2)"/><stop offset=".5" stop-color="var(--chrome)"/><stop offset="1" stop-color="var(--chrome-2)"/></linearGradient>
    </defs>`;
    const S = 'fill="url(#lthr)" stroke="var(--leather)" stroke-width=".6" stroke-linejoin="round"';
    const C = 'fill="url(#chrm)" stroke="var(--chrome-2)" stroke-width=".6"';
    const P = {
      recliner: `<path d="M42 104 L46 88 M70 102 L68 86" stroke="var(--chrome-2)" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 104 L82 100 L88 106 L36 110 Z" ${C}/>
        <path d="M14 52 L34 49 L34 54 L14 57 Z" fill="var(--chrome)" stroke="var(--chrome-2)" stroke-width=".6"/>
        <path d="M30 22 C30 15 36 11 44 12 L60 14 C66 15 68 19 67 25 L61 70 L35 74 Z" ${S}/>
        <path d="M33 18 C34 13 40 11 46 12 L58 14 C62 15 63 18 62 22 L61 28 L34 29 Z" fill="var(--leather-2)" opacity=".9"/>
        <path d="M36 44 L62 40" stroke="var(--leather)" stroke-width="1" opacity=".6"/>
        <path d="M32 72 L64 66 C70 65 76 68 78 72 L82 80 C83 84 80 87 76 87 L42 90 C37 90 34 87 33 83 Z" ${S}/>
        <path d="M76 78 L100 94 C103 96 103 100 100 101 L94 103 L72 88 Z" ${S}/>
        <path d="M38 62 L72 56 C75 56 77 58 76 61 L74 64 L40 70 Z" ${C}/>`,
      side: '',
      divan: `<path d="M12 72 L12 46 C12 42 16 40 20 40 L84 33 C88 33 90 35 90 39 L88 62 Z" ${S}/>
        <path d="M12 72 L88 62 L108 70 L32 82 Z" fill="var(--leather-2)" stroke="var(--leather)" stroke-width=".6"/>
        <path d="M32 82 L108 70 L108 84 L32 98 Z" ${S}/>
        <path d="M37 50 L39 77 M62 46 L64 73" stroke="var(--leather)" stroke-width="1" opacity=".7"/>
        <path d="M32 98 L32 104 M106 85 L106 90" stroke="var(--chrome-2)" stroke-width="3" stroke-linecap="round"/>`,
      dining: `<path d="M66 54 L112 48 L116 54 L70 60 Z" fill="var(--table)" stroke="var(--chrome-2)" stroke-width=".6"/><path d="M92 56 L92 96 M84 98 L102 96" stroke="var(--chrome-2)" stroke-width="3" stroke-linecap="round"/>
        <path d="M22 20 C22 15 26 12 31 13 L44 15 C48 16 50 19 49 23 L46 64 L24 66 Z" ${S}/>
        <path d="M22 64 L54 60 C58 60 61 62 61 66 L60 72 L26 77 C22 77 20 74 20 71 Z" ${S}/>
        <path d="M28 77 L28 104 M56 72 L58 100" stroke="var(--chrome-2)" stroke-width="3.4" stroke-linecap="round"/>`,
      bed: `<path d="M14 40 L14 66 L50 78 L50 52 Z" fill="var(--table)" stroke="var(--chrome-2)" stroke-width=".6"/>
        <path d="M14 66 L74 54 L110 64 L50 78 Z" fill="var(--surface-2)" stroke="var(--chrome-2)" stroke-width=".6"/>
        <path d="M50 78 L110 64 L110 76 L50 92 Z M14 66 L50 78 L50 92 L14 78 Z" ${S}/>
        <path d="M22 60 L40 56 C43 56 45 58 44 61 L42 64 L24 68 C21 68 20 66 20 64 Z M44 56 L62 52 C65 52 67 54 66 57 L64 60 L46 64 C43 64 42 62 42 60 Z" fill="var(--surface)" stroke="var(--chrome-2)" stroke-width=".6"/>`,
      lav: `<path d="M40 30 L70 26 L72 54 L42 58 Z" fill="var(--surface-2)" stroke="var(--chrome-2)" stroke-width=".8"/>
        <path d="M30 62 L82 56 C84 74 74 88 58 90 C42 92 32 80 30 62 Z" fill="var(--surface-2)" stroke="var(--chrome-2)" stroke-width=".8"/>
        <ellipse cx="56" cy="60" rx="24" ry="5" fill="var(--leather-2)" opacity=".5"/><path d="M50 90 L50 104 M64 88 L64 102" stroke="var(--chrome-2)" stroke-width="3"/>`,
    };
    P.side = P.recliner;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${D}${P[kind] || P.recliner}</svg>`;
  }

  return { build, seatInfo, icon, SEAT_KINDS };
})();
