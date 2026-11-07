/* Top-down cabin floorplan, nose at the top. Built from jet.layout.zones rows (see js/data/fleet.js). */
const Floorplan = (() => {
  const U = 26;                 // px per layout unit
  const VW = 260;               // svg width
  const CX0 = 40, CX1 = 220;    // cabin interior x range
  const AISLE = 34;
  const SW = (CX1 - CX0 - AISLE) / 2; // side width
  const LEN = { pair: 3, single: 1.35, side: 1.25, divan2: 2, divan3: 2.8, dine3: 3, bed: 3.6, door: 1.4, galley: 1.6,
    lav: 2, lavb: 2, wardrobe: 1.3, crew: 1.8, tv: 1.1, credenza: 1.4, ensuite: 2.6, empty: 1 };
  const SEAT_KINDS = {
    recliner: { name: 'Recliner', icon: 'recliner' },
    side: { name: 'Side-facing seat', icon: 'recliner' },
    divan: { name: 'Divan', icon: 'divan' },
    dining: { name: 'Dining chair', icon: 'dining' },
    lav: { name: 'Belted lavatory seat', icon: 'lav' },
    bed: { name: 'Suite bed', icon: 'bed' },
  };
  const cache = {};

  function build(jet) {
    if (cache[jet.id]) return cache[jet.id];
    const g = [];
    const seats = [];
    const zoneSpans = [];
    const NOSE = 92;
    let y = NOSE + 14;
    const zoneTops = [];

    jet.layout.zones.forEach((z, zi) => {
      let letter = 0;
      const zTop = y;
      zoneTops.push(zTop);
      const nextId = (kind) => {
        const id = `${zi + 1}${String.fromCharCode(65 + letter++)}`;
        seats.push({ id, kind, zone: zi });
        return id;
      };
      for (const row of z.rows) {
        const rowLen = row.F ? LEN[row.F] : Math.max(LEN[row.L] || 0, LEN[row.R] || 0);
        const h = rowLen * U;
        if (row.F) drawFull(row.F, y, h, nextId);
        else {
          if (row.L) drawSide(row.L, 'L', y, h, nextId);
          if (row.R) drawSide(row.R, 'R', y, h, nextId);
        }
        y += h + 6;
      }
      zoneSpans.push([zTop, y]);
      y += 8;
    });
    const cabinEnd = y;
    const TAIL = 80;
    const H = cabinEnd + TAIL;

    // shell: nose cone, cabin walls, tail cone
    const shell = `M${CX0 - 8},${NOSE} C${CX0 - 8},${NOSE - 52} ${VW / 2 - 40},10 ${VW / 2},8 C${VW / 2 + 40},10 ${CX1 + 8},${NOSE - 52} ${CX1 + 8},${NOSE}
      L${CX1 + 8},${cabinEnd} C${CX1 + 8},${cabinEnd + 40} ${VW / 2 + 22},${H - 6} ${VW / 2},${H - 4} C${VW / 2 - 22},${H - 6} ${CX0 - 8},${cabinEnd + 40} ${CX0 - 8},${cabinEnd} Z`;

    // zone dividers + numbers
    const zg = [];
    zoneSpans.forEach(([a, b], i) => {
      if (i > 0) zg.push(`<line class="fp-zone-line" x1="${CX0 - 4}" y1="${a - 7}" x2="${CX1 + 4}" y2="${a - 7}"/>`);
      zg.push(`<text class="fp-zone-n" x="14" y="${(a + b) / 2 + 3}" text-anchor="middle">${i + 1}</text>`);
      zg.push(`<rect class="fp-zone-hl" data-zone="${i}" x="${CX0 - 4}" y="${a - 4}" width="${CX1 - CX0 + 8}" height="${b - a - 2}" rx="8" opacity="0"/>`);
    });
    // cockpit seats
    const ck = `<g opacity=".7">${mini(VW / 2 - 26, NOSE - 34)}${mini(VW / 2 + 6, NOSE - 34)}</g><line x1="${CX0}" y1="${NOSE + 4}" x2="${CX1}" y2="${NOSE + 4}" stroke="var(--jet-line)" stroke-width="1.4"/>`;

    const total = zoneSpans[zoneSpans.length - 1][1] - zoneSpans[0][0];
    const zoneFrac = zoneSpans.map(([a, b]) => [(a - zoneSpans[0][0]) / total, (b - zoneSpans[0][0]) / total]);
    const svgInner = `<path class="fp-shell" d="${shell}"/>${ck}${zg.join('')}${g.join('')}`;
    const out = {
      svg: (sel, mine) => `<svg viewBox="0 0 ${VW} ${H}" role="group" aria-label="${Util.esc(t('Cabin floorplan, nose at top'))}">${svgInner}</svg>`
        .replace(/data-seat="([^"]+)" class="fp-seat"/g, (m, id) => `data-seat="${id}" class="fp-seat${id === sel ? ' sel' : ''}${id === mine ? ' mine' : ''}"`),
      seats,
      count: seats.filter((s) => s.kind !== 'bed').length,
      zoneFrac,
    };
    cache[jet.id] = out;
    return out;

    /* ---- drawing helpers ---- */
    function sideX(side) { return side === 'L' ? CX0 : CX1 - SW; }
    function wallX(side) { return side === 'L' ? CX0 : CX1; }

    function seatG(id, kind, inner) {
      const label = `${t('Seat')} ${id}, ${t(SEAT_KINDS[kind].name)}`;
      return `<g data-seat="${id}" class="fp-seat" tabindex="0" role="button" aria-label="${Util.esc(label)}">${inner}</g>`;
    }
    function chair(x, y, w, h, facing) {
      // facing: 'fwd' (back at bottom), 'aft' (back at top), 'right' (back at left), 'left' (back at right)
      let back = '';
      if (facing === 'fwd') back = `<rect class="back" x="${x + 2}" y="${y + h - 7}" width="${w - 4}" height="7" rx="3"/>`;
      if (facing === 'aft') back = `<rect class="back" x="${x + 2}" y="${y}" width="${w - 4}" height="7" rx="3"/>`;
      if (facing === 'right') back = `<rect class="back" x="${x}" y="${y + 2}" width="7" height="${h - 4}" rx="3"/>`;
      if (facing === 'left') back = `<rect class="back" x="${x + w - 7}" y="${y + 2}" width="7" height="${h - 4}" rx="3"/>`;
      return `<rect class="cush" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${back}`;
    }
    function fix(x, y, w, h, label) {
      return `<rect class="fp-fix" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>` +
        (label ? `<text class="fp-fix-t" x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle">${Util.esc(t(label))}</text>` : '');
    }
    function mini(x, y) { return `<rect x="${x}" y="${y}" width="20" height="20" rx="6" fill="var(--surface-2)" stroke="var(--jet-line)"/>`; }

    function drawSide(mod, side, y, h, nextId) {
      const x = sideX(side);
      const len = LEN[mod] * U;
      const cw = SW - 14; // chair width
      const cxp = side === 'L' ? x + 4 : x + 10;
      switch (mod) {
        case 'pair': {
          const ch = U * 1.1;
          g.push(seatG(nextId('recliner'), 'recliner', chair(cxp, y, cw, ch, 'aft')));
          g.push(`<rect class="fp-table" x="${cxp + 8}" y="${y + ch + 4}" width="${cw - 16}" height="${len - 2 * ch - 8}" rx="4"/>`);
          g.push(seatG(nextId('recliner'), 'recliner', chair(cxp, y + len - ch, cw, ch, 'fwd')));
          break;
        }
        case 'single':
          g.push(seatG(nextId('recliner'), 'recliner', chair(cxp, y + 2, cw, U * 1.1, 'fwd')));
          break;
        case 'side': {
          const sx = side === 'L' ? x + 2 : x + SW - U * 1.15 - 2;
          g.push(seatG(nextId('side'), 'side', chair(sx, y + 2, U * 1.15, U * 1.1, side === 'L' ? 'right' : 'left')));
          break;
        }
        case 'divan2': case 'divan3': {
          const nPl = mod === 'divan3' ? 3 : 2;
          const bw = U * 1.05;
          const bx = side === 'L' ? x + 2 : x + SW - bw - 2;
          const pl = (len - 4) / nPl;
          for (let i = 0; i < nPl; i++) g.push(seatG(nextId('divan'), 'divan', chair(bx, y + 2 + i * pl, bw, pl - 2, side === 'L' ? 'right' : 'left')));
          break;
        }
        case 'dine3': {
          const tw = U * 1.0, th = len - U * 2.1;
          const tx = side === 'L' ? x + 2 : x + SW - tw - 2;
          const cx2 = side === 'L' ? tx + tw + 4 : tx - U * 1.0 - 4;
          g.push(seatG(nextId('dining'), 'dining', chair(tx, y, tw, U * 0.95, 'aft')));
          g.push(`<rect class="fp-table" x="${tx}" y="${y + U * 1.05}" width="${tw}" height="${th}" rx="5"/>`);
          g.push(seatG(nextId('dining'), 'dining', chair(cx2, y + U * 1.05 + th / 2 - U * 0.5, U * 1.0, U, side === 'L' ? 'left' : 'right')));
          g.push(seatG(nextId('dining'), 'dining', chair(tx, y + len - U * 0.95, tw, U * 0.95, 'fwd')));
          break;
        }
        case 'bed': {
          const bid = nextId('bed');
          const bw = SW + 6, bx = side === 'L' ? x : x - 6;
          g.push(seatG(bid, 'bed', `<rect class="cush" x="${bx}" y="${y + 2}" width="${bw}" height="${len - 4}" rx="9"/>` +
            `<rect class="back" x="${bx + 6}" y="${y + 8}" width="${bw / 2 - 9}" height="14" rx="6"/><rect class="back" x="${bx + bw / 2 + 3}" y="${y + 8}" width="${bw / 2 - 9}" height="14" rx="6"/>`));
          break;
        }
        case 'door': {
          const wx = wallX(side);
          g.push(`<rect x="${side === 'L' ? wx - 10 : wx}" y="${y + 6}" width="10" height="${len - 12}" fill="var(--sky-deep)" opacity=".8" rx="2"/>`);
          g.push(`<text class="fp-fix-t" x="${side === 'L' ? wx + 22 : wx - 22}" y="${y + len / 2 + 3}" text-anchor="middle">${Util.esc(t('Door'))}</text>`);
          break;
        }
        case 'galley': g.push(fix(x + 2, y + 2, SW - 4, len - 4, 'Galley')); break;
        case 'lav': g.push(fix(x + 2, y + 2, SW - 4, len - 4, 'Lav')); break;
        case 'wardrobe': g.push(fix(x + 2, y + 2, SW - 4, len - 4, 'Closet')); break;
        case 'crew': g.push(fix(x + 2, y + 2, SW - 4, len - 4, 'Crew rest')); break;
        case 'tv': g.push(fix(side === 'L' ? x + 2 : x + SW - 18, y + 2, 16, len - 4, '')); g.push(`<text class="fp-fix-t" x="${side === 'L' ? x + 34 : x + SW - 34}" y="${y + len / 2 + 3}" text-anchor="middle">TV</text>`); break;
        case 'credenza': g.push(fix(x + 2, y + 2, SW - 4, len - 4, 'Credenza')); break;
        default: break;
      }
    }

    function drawFull(mod, y, h, nextId) {
      const w = CX1 - CX0;
      if (mod === 'galley') {
        g.push(fix(CX0 + 2, y + 2, SW - 4, h - 4, 'Galley'));
        g.push(fix(CX1 - SW + 2, y + 2, SW - 4, h - 4, 'Galley'));
        return;
      }
      const label = mod === 'ensuite' ? 'En suite' : 'Lavatory';
      g.push(`<rect class="fp-fix" x="${CX0 + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="8"/>`);
      g.push(`<line x1="${CX0 + w / 2 - 16}" y1="${y + 2}" x2="${CX0 + w / 2 + 16}" y2="${y + 2}" stroke="var(--surface)" stroke-width="3"/>`);
      g.push(`<text class="fp-fix-t" x="${CX0 + w / 2}" y="${y + h / 2 + (mod === 'lavb' ? -8 : 3)}" text-anchor="middle">${Util.esc(t(label))}</text>`);
      if (mod === 'lavb') g.push(seatG(nextId('lav'), 'lav', chair(CX0 + w / 2 - 14, y + h - U * 1.05 - 4, 28, U * 1.0, 'fwd')));
      if (mod === 'ensuite') g.push(`<circle cx="${CX1 - 26}" cy="${y + h / 2}" r="12" fill="none" stroke="var(--jet-line)" stroke-dasharray="2 2"/><text class="fp-fix-t" x="${CX1 - 26}" y="${y + h / 2 + 22}" text-anchor="middle">${Util.esc(t('Shower'))}</text>`);
    }
  }

  function seatInfo(jet, kind) {
    const tall = jet.cabin.h >= 70;
    const D = {
      recliner: jet.berth && tall
        ? t('Swivels, tracks and reclines. Facing pairs line up to make a flat bed.')
        : t('Swivels, tracks and reclines. The {h} cabin is too low for full beds.', { h: Util.ftIn(jet.cabin.h) }),
      side: t('Single side-facing seat by the door. Handy for crew-side chats and short legs.'),
      divan: t('Side-facing sofa, belted for takeoff and landing. Folds flat into a berth.'),
      dining: t('Sits at the conference table for meals and meetings. Belted for takeoff and landing.'),
      lav: t('Certified overflow seat in the lavatory. Charter operators rarely sell it.'),
      bed: t('Fixed bed in the private suite. Usually not certified for takeoff and landing, so it is not counted as a seat.'),
    };
    return { name: t(SEAT_KINDS[kind].name), desc: D[kind], icon: SEAT_KINDS[kind].icon };
  }

  function icon(kind) {
    const S = 'fill="var(--sky)" stroke="var(--sky-deep)" stroke-width="2" stroke-linejoin="round"';
    const L = 'stroke="var(--ink-2)" stroke-width="3" stroke-linecap="round" fill="none"';
    const P = {
      recliner: `<path d="M24 14c6-3 12 0 13 7l4 30h22c6 0 9 4 9 9v4H33c-5 0-8-3-9-8l-5-32c-1-5 1-9 5-10z" ${S}/><path d="M40 64v12M66 64v12M30 76h44" ${L}/>`,
      divan: `<rect x="10" y="30" width="68" height="18" rx="7" ${S}/><rect x="10" y="44" width="68" height="16" rx="6" ${S}/><path d="M18 60v10M70 60v10" ${L}/>`,
      dining: `<path d="M22 18h14v36H22z" ${S}/><path d="M22 50h26v8H22z" ${S}/><path d="M26 58v18M44 58v18M56 40h26M69 40v36M60 76h18" ${L}/>`,
      lav: `<rect x="30" y="16" width="26" height="22" rx="6" ${S}/><path d="M24 42h40c0 14-8 22-20 22s-20-8-20-22z" ${S}/><path d="M44 64v12" ${L}/>`,
      bed: `<rect x="8" y="38" width="74" height="22" rx="7" ${S}/><rect x="12" y="28" width="22" height="12" rx="5" ${S}/><path d="M8 60v12M82 60v12M8 48h74" ${L}/>`,
    };
    return `<svg viewBox="0 0 88 88" aria-hidden="true">${P[kind] || P.recliner}</svg>`;
  }

  return { build, seatInfo, icon, SEAT_KINDS };
})();
