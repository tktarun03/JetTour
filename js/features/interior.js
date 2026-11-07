/* Interior: cabin sections 1..N, highlighted on the side view and the floorplan. */
const Interior = (() => {
  const active = {};

  function render(j, s) {
    const fp = Floorplan.build(j);
    const zi = Math.min(active[j.id] || (j.layout.zones.length > 2 ? 1 : 0), j.layout.zones.length - 1);
    const z = j.layout.zones[zi];
    const zSeats = fp.seats.filter((x) => x.zone === zi);
    const counts = {};
    zSeats.forEach((x) => { counts[x.kind] = (counts[x.kind] || 0) + 1; });
    const seatChips = Object.entries(counts).map(([k, n]) => `<span class="tag">${n} × ${Util.esc(Floorplan.seatInfo(j, k).name)}</span>`).join('');
    return `<div class="ov-head"><h1 class="title">${t('Cabin')} <b>${t('Interior')}</b></h1>
        <div class="nav"><a class="icon-btn" href="#jet-${j.id}" aria-label="${t('Back to overview')}">${Icon.back}</a></div></div>
      <div class="model-line"><div><div class="eyebrow">${Util.esc(j.maker)}</div><div class="m">${Util.esc(j.model)}</div></div>
        <span class="tag">${Util.len(j.cabin.l, s.units)}</span></div>
      <div class="hero-art">${JetArt.side(j, { zones: fp.zoneFrac, hl: zi })}</div>
      <div class="sections"><span class="lbl">${t('Sections')}</span>
        <div class="chips" role="tablist">${j.layout.zones.map((zz, i) => `<button class="chip" role="tab" data-act="zone" data-id="${j.id}" data-v="${i}" aria-pressed="${i === zi}" aria-selected="${i === zi}" aria-label="${Util.esc(t(zz.name))}">${i + 1}</button>`).join('')}</div>
      </div>
      <article class="zone-card">
        <div class="eyebrow">${t('Section')} ${zi + 1} ${t('of')} ${j.layout.zones.length}</div>
        <h3>${Util.esc(t(z.name))}</h3>
        <p>${Util.esc(t(z.desc))}</p>
        <div class="zone-stats">${seatChips || `<span class="tag">${t('No passenger seats')}</span>`}</div>
        <div class="row" style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn primary" href="#seats-${j.id}">${Icon.seat}${t('Pick a seat')}</a>
        </div>
      </article>
      <h2 class="sec">${t('Floorplan')}</h2>
      <div class="fp-wrap" data-hl="${zi}">${fp.svg(null, s.seats[j.id]).replace(`data-zone="${zi}" `, `data-zone="${zi}" style="opacity:.38" `)}</div>
      <p class="legend-note">${Util.esc(t(j.layout.note))}</p>`;
  }

  function setZone(id, i) { active[id] = i; }
  return { render, setZone };
})();
