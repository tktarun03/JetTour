/* Interior: cabin sections 1..N with a cutaway on the side view, "+" hotspots, jet card and floorplan. */
const Interior = (() => {
  const active = {};

  function render(j, s) {
    const fp = Floorplan.build(j);
    const n = j.layout.zones.length;
    const zi = Math.min(active[j.id] != null ? active[j.id] : (n > 2 ? 1 : 0), n - 1);
    const z = j.layout.zones[zi];
    const zoneKinds = j.layout.zones.map((_, i) => fp.seats.filter((x) => x.zone === i).map((x) => x.kind));
    const counts = {};
    fp.seats.filter((x) => x.zone === zi).forEach((x) => { counts[x.kind] = (counts[x.kind] || 0) + 1; });
    const seatChips = Object.entries(counts).map(([k, c]) => `<span class="tag">${c} × ${Util.esc(Floorplan.seatInfo(j, k).name)}</span>`).join('');
    const next = (zi + 1) % n;

    return `${Overview.head(j, s, 'cabin', `${t('Cabin')} <b>${t('Interior')}</b>`)}
      <div class="stage">
        <div class="side-pills">
          <a class="circle" href="#specs-${j.id}" aria-label="${t('Baggage and specs')}">${Icon.bag}</a>
          <a class="circle" href="#seats-${j.id}" aria-label="${t('Seats')}">${Icon.users}</a>
        </div>
        <div class="hero-art">${JetArt.side(j, { gear: true, door: true, zones: fp.zoneFrac, hl: zi, cutaway: true, hotspots: true, zoneKinds })}</div>
      </div>
      <div class="sections"><span class="lbl">${t('Sections')}</span>
        <div class="sec-pills" role="tablist">${j.layout.zones.map((zz, i) => `<button role="tab" data-act="zone" data-id="${j.id}" data-v="${i}" aria-pressed="${i === zi}" aria-selected="${i === zi}" aria-label="${Util.esc(t(zz.name))}">${i + 1}</button>`).join('')}</div>
        <button class="circle" data-act="zone" data-id="${j.id}" data-v="${next}" aria-label="${t('Next section')}">${Icon.right}</button>
      </div>
      <div class="int-grid">
        <a class="jet-card sky mini-jet" href="#jet-${j.id}">
          <div><div class="pax">${j.paxMax}</div><div class="pax-l">${t('Passengers')}</div></div>
          <span class="go" aria-hidden="true">${Icon.arrow}</span>
          <div class="art photo">${JetMedia.or(j, {}, () => JetArt.plan(j))}</div>
          <div class="maker">${Util.esc(j.maker)}</div><div class="model">${Util.esc(j.model)}</div>
        </a>
        ${Overview.fpCard(j, s, { hl: zi, tools: false })}
        <article class="zone-card glass">
          <div class="eyebrow">${t('Section')} ${zi + 1} ${t('of')} ${n}</div>
          <h3>${Util.esc(t(z.name))}</h3>
          <p>${Util.esc(t(z.desc))}</p>
          <div class="zone-stats">${seatChips || `<span class="tag">${t('No passenger seats')}</span>`}</div>
          <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary" href="#seats-${j.id}">${Icon.seat}${t('Pick a seat')}</a></div>
        </article>
      </div>
      <p class="legend-note">${Util.esc(t(j.layout.note))}</p>`;
  }

  function setZone(id, i) { active[id] = i; }
  return { render, setZone };
})();
