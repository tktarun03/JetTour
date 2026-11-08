/* Fleet list: "Select Your Aircraft". */
const Home = (() => {
  const SORTS = {
    range: { label: 'Longest range', fn: (a, b) => b.rangeNm - a.rangeNm },
    pax: { label: 'Most passengers', fn: (a, b) => b.paxMax - a.paxMax || b.rangeNm - a.rangeNm },
    cabin: { label: 'Longest cabin', fn: (a, b) => b.cabin.l - a.cabin.l },
    speed: { label: 'Fastest', fn: (a, b) => b.speedKt - a.speedKt },
    maker: { label: 'Maker A–Z', fn: (a, b) => (a.maker + a.model).localeCompare(b.maker + b.model) },
  };

  function list(s) {
    const f = s.filter in CLASSES ? s.filter : 'all';
    return FLEET.filter((j) => f === 'all' || j.cls === f).sort((SORTS[s.sort] || SORTS.range).fn);
  }

  function card(j, i, s) {
    const saved = s.saved.includes(j.id);
    const [rv, ru] = Util.distParts(j.rangeNm, s.units);
    return `<a class="jet-card${i % 2 === 0 ? ' sky' : ''}" href="#jet-${j.id}" data-jet="${j.id}" style="--i:${i}">
      <div><div class="pax num">${j.paxMax}</div><div class="pax-l">${t('Passengers')}</div></div>
      <div class="tags">${saved ? `<span class="tag">${t('Saved')}</span>` : ''}${j.successor ? `<span class="tag">${t('Successor due')}</span>` : ''}</div>
      <span class="go" aria-hidden="true">${Icon.arrow}</span>
      <div class="art photo">${JetMedia.or(j, { eager: i < 2 }, () => JetArt.plan(j))}</div>
      <div class="foot-row">
        <div><div class="maker">${Util.esc(j.maker)}</div><div class="model">${Util.esc(j.model)} · ${t(CLASSES[j.cls].label)}</div></div>
        <div class="range-mini">${rv} ${ru}<br>${t('range')}</div>
      </div>
    </a>`;
  }

  function checklist(s) {
    if (s.checklistHidden) return '';
    const steps = [
      [s.opened.length > 0, t('Open an aircraft')],
      [Object.keys(s.seats).length > 0, t('Pick your seat on a floorplan')],
      [s.compare.length >= 2, t('Compare two jets')],
      [s.saved.length > 0, t('Save a favourite')],
    ];
    const done = steps.filter((x) => x[0]).length;
    if (done === steps.length) return '';
    return `<section class="checklist glass" aria-label="${t('Get started')}">
      <header><h3>${t('Get started')} <span class="muted small num">${done}/${steps.length}</span></h3>
      <button class="link-btn" data-act="hide-checklist">${t('Hide')}</button></header>
      <ul>${steps.map(([ok, label]) => `<li class="${ok ? 'done' : ''}"><span class="tick">${ok ? Icon.check : ''}</span>${label}</li>`).join('')}</ul>
    </section>`;
  }

  function render(s) {
    const items = list(s);
    const chips = [['all', t('All')], ...Object.entries(CLASSES).map(([k, v]) => [k, t(v.label)])];
    return `<h1 class="title">${t('Select Your')} <b>${t('Aircraft')}</b></h1>
      ${checklist(s)}
      <div class="search glass">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>
        <input id="q" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="${t('Search maker or model')}" aria-label="${t('Search aircraft')}" value="${Util.esc(query)}">
      </div>
      <div class="chips scope" role="group" aria-label="${t('Filter by class')}">
        ${chips.map(([k, l]) => `<button class="chip" data-act="filter" data-v="${k}" aria-pressed="${s.filter === k}">${l}</button>`).join('')}
      </div>
      <div class="toolbar">
        <span class="muted small" id="count" aria-live="polite">${Util.plural(items.length, t('aircraft'), t('aircraft'))}</span>
        <label class="sr-only" for="sort" hidden>${t('Sort')}</label>
        <select id="sort" data-act="sort" aria-label="${t('Sort aircraft')}">
          ${Object.entries(SORTS).map(([k, v]) => `<option value="${k}"${s.sort === k ? ' selected' : ''}>${t(v.label)}</option>`).join('')}
        </select>
      </div>
      <div class="cards">${items.map((j, i) => card(j, i, s)).join('')}</div>
      <div class="empty glass" id="no-match" hidden><h3>${t('No jets match')}</h3><p>${t('Try a maker such as Gulfstream, or clear the search.')}</p></div>
      <p class="legend-note">${t('Specs from manufacturer and trade sources, {d}. Independent guide, not affiliated with any manufacturer.', { d: APP.dataAsOf })}</p>`;
  }

  /* Live search: hide cards in place (no re-render, so the field keeps focus and the keyboard stays up). */
  let query = '';
  function filterLive(q) {
    query = q;
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let n = 0;
    document.querySelectorAll('.cards .jet-card[data-jet]').forEach((c) => {
      const j = FLEET_BY_ID[c.dataset.jet];
      const hay = `${j.maker} ${j.model} ${CLASSES[j.cls].label}`.toLowerCase();
      const hit = words.every((w) => hay.includes(w));
      c.hidden = !hit;
      if (hit) n++;
    });
    const cnt = document.getElementById('count');
    if (cnt) cnt.textContent = Util.plural(n, t('aircraft'), t('aircraft'));
    const none = document.getElementById('no-match');
    if (none) none.hidden = n > 0;
  }
  function afterRender() { if (query) filterLive(query); }

  return { render, card, SORTS, filterLive, afterRender };
})();
