/* Aircraft overview: hero, key numbers, full spec list with source markers, sources. */
const Overview = (() => {
  const mark = (j, key) => {
    if ((j.tp || []).includes(key)) return `<span class="mark" title="${t('Third-party figure')}">3P</span>`;
    if ((j.calc || []).includes(key)) return `<span class="mark" title="${t('Converted from Mach')}">≈</span>`;
    return '';
  };

  function neighbours(id) {
    const i = FLEET.findIndex((j) => j.id === id);
    return [FLEET[(i - 1 + FLEET.length) % FLEET.length], FLEET[(i + 1) % FLEET.length]];
  }

  function render(j, s) {
    const u = s.units;
    const [prev, next] = neighbours(j.id);
    const [rv, ru] = Util.distParts(j.rangeNm, u);
    const fp = Floorplan.build(j);
    const rate = CLASSES[j.cls].rate;
    const rows = [
      [t('Maker'), Util.esc(j.maker)],
      [t('Class'), t(CLASSES[j.cls].label)],
      [t('Passengers'), `${t('up to')} ${j.paxMax}${mark(j, 'paxMax')} · ${t('typical')} ${j.paxTyp}${mark(j, 'paxTyp')}`],
      [t('Crew'), Util.esc(j.crew)],
      [t('Range'), `${Util.dist(j.rangeNm, u)}<br><span class="muted small">${Util.esc(j.rangeCond)}</span>`],
      [t('Max cruise'), `${Util.speed(j.speedKt, u)}${mark(j, 'speedKt')}${j.mach ? ` · Mach ${j.mach}${j.machIsLimit ? ' ' + t('limit') : ''}` : ''}`],
      [t('Ceiling'), Util.alt(j.ceilingFt, u)],
      [t('Cabin length'), Util.len(j.cabin.l, u) + mark(j, 'cabinL')],
      [t('Cabin width'), Util.len(j.cabin.w, u) + mark(j, 'cabinW')],
      [t('Cabin height'), Util.len(j.cabin.h, u) + mark(j, 'cabinH')],
      [t('Cabin volume'), j.volume ? Util.vol(j.volume, u) + mark(j, 'volume') : '<span class="muted">' + t('Not published') + '</span>'],
      [t('Baggage'), j.baggage ? Util.vol(j.baggage, u) + mark(j, 'baggage') : '<span class="muted">' + t('Not published') + '</span>'],
      [t('Engines'), `${j.engineCount} × ${Util.esc(j.engines)}`],
      [t('Windows'), j.windows ? `${j.windowsNote === 'up to' ? t('up to') + ' ' : ''}${j.windows}${j.windowsNote && j.windowsNote !== 'up to' ? ' ' + Util.esc(t(j.windowsNote)) : ''}` : '<span class="muted">' + t('Not published') + '</span>'],
      [t('In service'), j.eis ? Util.esc(j.eis) + mark(j, 'eis') : '<span class="muted">' + t('Not confirmed') + '</span>'],
      [t('New list price'), j.price ? Util.money(j.price[0], j.price[1]) + mark(j, 'price') : '<span class="muted">' + t('Not published') + '</span>'],
      [t('Charter estimate'), `${Util.money(rate[0], rate[1])} ${t('per hour')}<br><span class="muted small">${t('{c} class range, 2026 guides, before taxes and fees', { c: t(CLASSES[j.cls].label) })}</span>`],
    ];
    return `<div class="ov-head">
        <h1 class="title">${t('Aircraft')} <b>${t('Overview')}</b></h1>
        <div class="nav">
          <a class="icon-btn" href="#jet-${prev.id}" aria-label="${t('Previous aircraft')}: ${Util.esc(prev.model)}">${Icon.prev}</a>
          <a class="icon-btn" href="#jet-${next.id}" aria-label="${t('Next aircraft')}: ${Util.esc(next.model)}">${Icon.next}</a>
        </div>
      </div>
      <div class="hero-art">${JetArt.side(j, { gear: true, door: true })}
        <div class="side-pills" aria-hidden="true"><span>${Icon.bag}</span><span>${Icon.users}</span></div>
      </div>
      <div class="model-line"><div><div class="eyebrow">${Util.esc(j.maker)}</div><div class="m">${Util.esc(j.model)}</div></div>
        <span class="tag">${t(CLASSES[j.cls].label)}</span></div>
      ${j.status ? `<p class="status">${Util.esc(t(j.status))}</p>` : ''}
      <div class="tiles">
        <div class="tile sky"><div class="v num">${j.paxMax}<small>${t('max')}</small></div><div class="k eyebrow">${t('Passengers')}</div><div class="note">${t('{n} seats in the layout shown', { n: fp.count })}</div></div>
        <div class="tile"><div class="v num">${rv}<small>${ru}</small></div><div class="k eyebrow">${t('Range')}</div><div class="note">${Util.esc(j.rangeCond.split(',')[0])}</div></div>
        <div class="tile"><div class="v num">${j.mach ? 'M ' + (String(j.mach).length > 4 ? String(j.mach) : j.mach.toFixed(2)) : Util.num(j.speedKt)}<small>${j.mach ? '' : 'kt'}</small></div><div class="k eyebrow">${j.mach && j.machIsLimit ? t('Speed limit') : t('Top speed')}</div><div class="note">${Util.speed(j.speedKt, u)}${(j.calc || []).includes('speedKt') ? ' ' + t('approx.') : ''}</div></div>
        <div class="tile"><div class="v num">${Util.num(j.ceilingFt / 1000)}k<small>ft</small></div><div class="k eyebrow">${t('Ceiling')}</div><div class="note">${Util.alt(j.ceilingFt, 'metric')}</div></div>
      </div>
      <div class="cross">${JetArt.cross(j)}<div><div class="eyebrow">${t('Cabin, to scale')}</div>
        <div><b>${Util.len(j.cabin.l, u)}</b> ${t('long')}</div><div class="muted small">${Util.len(j.cabin.w, u)} ${t('wide')} · ${Util.len(j.cabin.h, u)} ${t('tall')}${mark(j, 'cabinH')}</div>
        <div class="muted small">${t('Figure is 5 ft 10 in (1.78 m)')}</div></div></div>
      <h2 class="sec">${t('Specifications')}</h2>
      <div class="spec-list">${rows.map(([k, v]) => `<div class="spec-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}</div>
      <p class="legend-note"><span class="mark">3P</span> ${t('third-party figure, no manufacturer number found')} · <span class="mark">≈</span> ${t('converted by us')}</p>
      <h2 class="sec">${t('Sources')}</h2>
      <ol class="sources">${j.sources.map(([title, url]) => `<li><a href="${Util.esc(url)}" target="_blank" rel="noopener">${Util.esc(title)}</a></li>`).join('')}</ol>
      <p class="legend-note">${t('Spot a wrong figure?')} <a href="${Util.esc(issueUrl(j))}" target="_blank" rel="noopener">${t('Report it on GitHub')}</a></p>`;
  }

  function actionBar(j, s) {
    const saved = s.saved.includes(j.id), cmp = s.compare.includes(j.id);
    return `<div class="action-bar" role="toolbar" aria-label="${t('Aircraft actions')}">
      <span class="lbl">${t('Floorplan')}</span>
      <a class="icon-btn" href="#cabin-${j.id}" aria-label="${t('Interior sections')}">${Icon.grid}</a>
      <button class="icon-btn${cmp ? ' on' : ''}" data-act="compare" data-id="${j.id}" aria-pressed="${cmp}" aria-label="${t('Compare')}">${Icon.compare}</button>
      <button class="icon-btn${saved ? ' on' : ''}" data-act="save" data-id="${j.id}" aria-pressed="${saved}" aria-label="${t('Save')}">${saved ? Icon.heartFill : Icon.heart}</button>
      <a class="main-btn" href="#seats-${j.id}" style="display:inline-flex;align-items:center;text-decoration:none">${t('Seats')}</a>
    </div>`;
  }

  function issueUrl(j) {
    const title = `Spec correction: ${j.maker} ${j.model}`;
    const body = `Aircraft: ${j.maker} ${j.model}\nField:\nValue shown in JetTour:\nCorrect value:\nSource link:\n\nApp version ${APP.version}`;
    return `https://github.com/${APP.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=data`;
  }

  return { render, actionBar, issueUrl };
})();
