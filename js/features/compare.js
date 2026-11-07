/* Compare up to three jets, with bars drawn to scale against the largest value in the whole fleet. */
const Compare = (() => {
  const max = (f) => Math.max(...FLEET.map(f));

  function render(s) {
    const picked = s.compare.map((id) => FLEET_BY_ID[id]).filter(Boolean);
    const u = s.units;
    const pick = `<div class="cmp-pick" role="group" aria-label="${t('Choose aircraft to compare')}">
      ${FLEET.map((j) => `<button class="chip" data-act="compare" data-id="${j.id}" aria-pressed="${s.compare.includes(j.id)}">${Util.esc(j.model)}</button>`).join('')}
    </div>`;
    const head = `<h1 class="title">${t('Compare')} <b>${t('Aircraft')}</b></h1>${pick}`;
    if (picked.length === 0) {
      return `${head}<div class="empty">${JetArt.side(FLEET[8], { tilt: -4 })}<h3>${t('Nothing to compare yet')}</h3>
        <p>${t('Tap up to three jets above. Range, cabin and speed line up side by side.')}</p></div>`;
    }
    const bar = (v, m) => `<div class="bar"><span style="width:${Math.round((v / m) * 100)}%"></span></div>`;
    const R = [
      [t('Class'), (j) => t(CLASSES[j.cls].label)],
      [t('Passengers, max'), (j) => `${j.paxMax}${bar(j.paxMax, max((x) => x.paxMax))}`],
      [t('Range'), (j) => `${Util.dist(j.rangeNm, u)}${bar(j.rangeNm, max((x) => x.rangeNm))}<span class="muted small">${Util.esc(j.rangeCond.split(',')[0])}</span>`],
      [t('Max cruise'), (j) => `${Util.speed(j.speedKt, u)}${(j.calc || []).includes('speedKt') ? ' ≈' : ''}${bar(j.speedKt, max((x) => x.speedKt))}`],
      [t('Cabin length'), (j) => `${Util.len(j.cabin.l, u)}${bar(j.cabin.l, max((x) => x.cabin.l))}`],
      [t('Cabin width'), (j) => Util.len(j.cabin.w, u)],
      [t('Cabin height'), (j) => Util.len(j.cabin.h, u)],
      [t('Baggage'), (j) => (j.baggage ? Util.vol(j.baggage, u) : '—')],
      [t('Ceiling'), (j) => Util.alt(j.ceilingFt, u)],
      [t('Engines'), (j) => `${j.engineCount} × ${Util.esc(j.engines)}`],
      [t('Charter estimate'), (j) => `${Util.money(CLASSES[j.cls].rate[0], CLASSES[j.cls].rate[1])}/h`],
    ];
    return `${head}
      <div class="cmp-table-wrap"><table class="cmp-table"><colgroup><col class="k">${picked.map(() => '<col>').join('')}</colgroup>
        <thead><tr><th scope="col"><span class="eyebrow">${picked.length} ${t('of')} 3</span></th>${picked.map((j) => `<th scope="col"><a href="#jet-${j.id}">${Util.esc(j.model)}</a><div class="muted small">${Util.esc(j.maker)}</div></th>`).join('')}</tr></thead>
        <tbody>${R.map(([k, f]) => `<tr><th scope="row">${k}</th>${picked.map((j) => `<td>${f(j)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <p class="legend-note">${t('Ranges are published under different loads, so compare them with care. Charter figures are class ranges, not quotes.')}</p>
      <div style="display:flex;justify-content:flex-end"><button class="btn danger" data-act="clear-compare">${Icon.trash}${t('Clear all')}</button></div>`;
  }
  return { render };
})();
