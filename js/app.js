/* Boot, hash router, event delegation, preferences. Routes: #fleet #jet-<id> #cabin-<id> #seats-<id> #specs-<id> #compare #saved #more */
const App = (() => {
  const view = () => document.getElementById('view');
  let hostTheme = null;
  let lastRoute = null;
  let popSel = null;          // element to "spring pop" after the next render (symbol effect)

  function route() {
    const h = (location.hash || '#fleet').slice(1);
    const m = h.match(/^(jet|seats|cabin|specs)-([a-z0-9]+)$/);
    if (m && FLEET_BY_ID[m[2]]) return { name: m[1], jet: FLEET_BY_ID[m[2]] };
    if (['fleet', 'compare', 'saved', 'more'].includes(h)) return { name: h };
    return { name: 'fleet' };
  }

  function render(keepScroll) {
    const r = route();
    const s = Store.get();
    let html = '';
    if (r.jet) Actions.markOpened(r.jet.id);
    if (r.name === 'jet') html = Overview.render(r.jet, s);
    else if (r.name === 'seats') html = Seats.render(r.jet, s);
    else if (r.name === 'cabin') html = Interior.render(r.jet, s);
    else if (r.name === 'specs') html = Overview.specs(r.jet, s);
    else if (r.name === 'compare') html = Compare.render(s);
    else if (r.name === 'saved') html = Saved.render(s);
    else if (r.name === 'more') html = More.render(s);
    else html = Home.render(s);
    const y = window.scrollY;
    const v = view();
    v.innerHTML = html;
    v.classList.toggle('enter', !keepScroll && !Gestures.reduced()); // stagger only when arriving on a screen
    centreFloorplans();
    if (r.name === 'fleet') Home.afterRender();
    renderTabs(r);
    renderTop(s);
    renderAccessory(r, s);
    if (popSel) { document.querySelectorAll(popSel).forEach((el) => el.classList.add('pop')); popSel = null; }
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    lastRoute = r;
    document.title = r.jet ? `${r.jet.model} · ${APP.name}` : APP.name;
  }

  function renderTabs(r) {
    const cur = { fleet: 'fleet', jet: 'fleet', seats: 'fleet', cabin: 'fleet', specs: 'fleet', compare: 'compare', saved: 'saved', more: 'more' }[r.name];
    document.querySelectorAll('.tabbar a').forEach((a) => {
      if (a.dataset.tab === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function renderTop(s) {
    const c = document.getElementById('top-compare');
    const sv = document.getElementById('top-saved');
    for (const [el, n] of [[c, s.compare.length], [sv, s.saved.length]]) {
      if (!el) continue;
      const b = el.querySelector('.count');
      b.textContent = n; b.dataset.n = n;
    }
  }

  /* Scroll each horizontal floorplan so the selected seat or highlighted section is in view. */
  function centreFloorplans() {
    document.querySelectorAll('.fp-scroll').forEach((sc) => {
      const target = sc.querySelector('.fp-seat.sel') || sc.querySelector('.fp-zone-hl[style]');
      if (!target || sc.scrollWidth <= sc.clientWidth) return;
      const a = target.getBoundingClientRect(), b = sc.getBoundingClientRect();
      sc.scrollLeft += (a.left + a.width / 2) - (b.left + b.width / 2);
    });
  }

  /* Bottom accessory: compare tray above the tab bar while jets are waiting to be compared. */
  function renderAccessory(r, s) {
    const acc = document.getElementById('accessory');
    const n = s.compare.length;
    const show = n > 0 && r.name !== 'compare' && r.name !== 'more';
    document.body.classList.toggle('has-acc', show);
    acc.hidden = !show;
    if (!show) { acc.innerHTML = ''; return; }
    const names = s.compare.map((id) => FLEET_BY_ID[id] && FLEET_BY_ID[id].model).filter(Boolean);
    acc.innerHTML = `<span class="acc-dots">${s.compare.map(() => '<i></i>').join('')}${'<i class="off"></i>'.repeat(3 - n)}</span>
      <span class="acc-tx"><strong>${t('{n} of 3 in compare', { n })}</strong><span>${Util.esc(names.join(' · '))}</span></span>
      <a class="acc-btn" href="#compare">${t('Compare')}</a>`;
  }

  /* Hash navigation with a zoom transition (shared element: card art ↔ overview hero) where supported. */
  function navigate() {
    const next = route();
    const from = lastRoute;
    const update = () => {
      render(false);
      if (from && from.jet && !next.jet) {
        const art = document.querySelector(`.jet-card[data-jet="${from.jet.id}"] .art`);
        if (art) art.style.viewTransitionName = 'jet-hero';
      }
    };
    if (!document.startViewTransition || Gestures.reduced() || Sheet.isOpen()) return update();
    if (next.name === 'jet') {
      const art = document.querySelector(`.jet-card[data-jet="${next.jet.id}"] .art`);
      if (art) art.style.viewTransitionName = 'jet-hero';
    }
    try {
      const vt = document.startViewTransition(update);
      // a newer navigation can skip this one; that is expected, not an error
      [vt.ready, vt.finished, vt.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    } catch (e) { update(); }
  }

  function pop(sel) { popSel = sel; }
  function refresh() { render(true); }
  function go(name) { if (location.hash === '#' + name) render(); else location.hash = name; }

  function applyPrefs() {
    const s = Store.get();
    const root = document.documentElement;
    if (s.theme === 'system') { if (hostTheme) root.setAttribute('data-theme', hostTheme); else root.removeAttribute('data-theme'); }
    else root.setAttribute('data-theme', s.theme);
    root.style.setProperty('--fs', { s: 0.92, m: 1, l: 1.12, xl: 1.25 }[s.textSize] || 1);
  }

  function onClick(e) {
    const el = e.target.closest('[data-act]');
    const seat = e.target.closest('.fp-seat');
    if (seat && !el) {
      const r = route();
      if (r.name === 'seats') { Seats.select(seat.dataset.seat); refresh(); }
      else if (r.jet) { Seats.select(seat.dataset.seat); location.hash = `seats-${r.jet.id}`; }
      return;
    }
    if (!el || el.tagName === 'SELECT') return;
    const a = el.dataset.act;
    const s = Store.get();
    switch (a) {
      case 'filter': Store.set({ filter: el.dataset.v }); refresh(); break;
      case 'save': Actions.toggleSave(el.dataset.id); break;
      case 'compare': Actions.toggleCompare(el.dataset.id); break;
      case 'clear-compare': Actions.clearCompare(); break;
      case 'pick-seat': Actions.setSeat(el.dataset.id, el.dataset.seat); break;
      case 'zone': Interior.setZone(el.dataset.id, Number(el.dataset.v)); refresh(); break;
      case 'fp-fit': Seats.toggleFit(); refresh(); break;
      case 'seat-kind': { const r = route(); if (r.jet) { Seats.selectKind(r.jet, el.dataset.k); refresh(); } break; }
      case 'hide-checklist':
        Store.set({ checklistHidden: true }); refresh();
        toast(t('Hid the checklist'), { body: t('Bring it back from More'), undo: () => { Store.set({ checklistHidden: false }); refresh(); } });
        break;
      case 'toggle-checklist': Actions.setPref('checklistHidden', !s.checklistHidden, s.checklistHidden ? t('Showing the checklist') : t('Hid the checklist')); break;
      case 'pref': {
        const k = el.dataset.k, v = el.dataset.v;
        const labels = {
          theme: { system: t('Theme follows your device'), light: t('Switched to light theme'), dark: t('Switched to dark theme') },
          units: { imperial: t('Showing feet, nm and knots'), metric: t('Showing metres, km and km/h') },
          textSize: { s: t('Text is smaller'), m: t('Text is standard size'), l: t('Text is larger'), xl: t('Text is extra large') },
        };
        Actions.setPref(k, v, labels[k][v]);
        break;
      }
      case 'replay-intro': Intro.open(() => {}); break;
      case 'backup': {
        const txt = Store.exportJSON();
        const box = document.getElementById('backup-box');
        box.hidden = false; box.value = txt;
        const done = () => toast(t('Copied backup'), { kind: 'good', body: t('Paste it into a note or email to yourself') });
        const fallback = () => { box.focus(); box.select(); toast(t('Select and copy the text'), { body: t('Copying is blocked here, so the backup is shown below') }); };
        try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (err) { fallback(); }
        break;
      }
      case 'restore': {
        const box = document.getElementById('restore-box');
        try {
          Store.importJSON(box.value.trim());
          applyPrefs(); refresh();
          toast(t('Restored backup'), { kind: 'good', body: t('{n} saved, {m} seats', { n: Store.get().saved.length, m: Object.keys(Store.get().seats).length }) });
        } catch (err) {
          toast(t("Couldn't read that backup"), { kind: 'bad', body: t('Paste the whole text from Copy backup, including the first {') });
        }
        break;
      }
      case 'reset':
        Sheet.open({
          title: t('Erase everything?'),
          body: t('Saved jets, seats and settings are removed from this device. This cannot be undone.'),
          actions: [
            { label: t('Back up first'), fn: () => document.querySelector('[data-act="backup"]')?.click() },
            { label: t('Erase everything'), kind: 'danger', fn: () => { Store.reset(); applyPrefs(); refresh(); toast(t('Erased all data'), { kind: 'good', body: t('This device starts fresh') }); } },
          ],
          cancel: t('Keep my data'),
        });
        break;
      case 'refresh': Refresh.run('button'); break;
      case 'selfcheck': {
        const r = More.runCheck(); refresh();
        toast(r.pass ? t('All checks passed') : t('{n} checks failed', { n: r.failed.length }), { kind: r.pass ? 'good' : 'bad', body: r.pass ? t('{n} checks', { n: r.total }) : r.failed[0] });
        break;
      }
      default: break;
    }
  }

  /* Swipe on the hero: previous / next aircraft on the same tab. */
  function step(d) {
    const r = route();
    if (!r.jet) return;
    const i = FLEET.findIndex((j) => j.id === r.jet.id);
    const j = FLEET[(i + d + FLEET.length) % FLEET.length];
    location.hash = `${r.name}-${j.id}`;
  }

  /* Double tap: heart bursts over the hero (Instagram-style "like" = save). */
  function burst(el) {
    if (Gestures.reduced()) return;
    const h = document.createElement('span');
    h.className = 'burst';
    h.innerHTML = Icon.heartFill;
    el.appendChild(h);
    setTimeout(() => h.remove(), 750);
  }

  /* Touch and hold a fleet card: quick actions in an action sheet. */
  function quickActions(id) {
    const j = FLEET_BY_ID[id];
    if (!j) return;
    const s = Store.get();
    Sheet.open({
      title: `${j.maker} ${j.model}`,
      body: `${j.paxMax} ${t('passengers')} · ${Util.dist(j.rangeNm, s.units)}`,
      actions: [
        { label: t('Open'), kind: 'primary', fn: () => { location.hash = `jet-${id}`; } },
        { label: t('Seats'), fn: () => { location.hash = `seats-${id}`; } },
        { label: s.saved.includes(id) ? t('Remove from saved') : t('Save'), fn: () => Actions.toggleSave(id) },
        { label: s.compare.includes(id) ? t('Remove from compare') : t('Add to compare'), fn: () => Actions.toggleCompare(id) },
      ],
    });
  }

  function onInput(e) {
    if (e.target.id === 'q') Home.filterLive(e.target.value);
  }

  function onChange(e) {
    if (e.target.matches('select[data-act="sort"]')) { Store.set({ sort: e.target.value }); refresh(); }
  }
  function onKey(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && (e.target.classList.contains('fp-seat') || e.target.classList.contains('hot'))) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  }

  function updateNotice() {
    const s = Store.get();
    if (s.lastVersion && s.lastVersion !== APP.version) {
      const first = RELEASES[0].notes[0];
      setTimeout(() => toast(t('Updated to version {v}', { v: APP.version }), { body: t(first), action: { label: t("What's new"), fn: () => { go('more'); setTimeout(() => document.getElementById('versions')?.scrollIntoView(), 50); } } }), 600);
    }
    if (s.lastVersion !== APP.version) Store.set({ lastVersion: APP.version });
  }

  function boot() {
    hostTheme = document.documentElement.getAttribute('data-theme');
    Store.onFail = () => toast(t("Couldn't save"), { kind: 'bad', body: t('Storage is full or blocked. Back up so nothing is lost.'), action: { label: t('Back up'), fn: () => go('more') } });
    Store.load();
    applyPrefs();
    document.getElementById('logo').textContent = APP.short;
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('error', JetMedia.onError, true); // a missing photo falls back to the drawing
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', navigate);
    Gestures.lockZoom();
    Gestures.tabBarMinimize();
    Gestures.pullToRefresh(Refresh.run);
    Gestures.bind({
      swipe: { selector: '.stage', left: () => step(1), right: () => step(-1) },
      doubleTap: { selector: '.stage .hero-art', fn: (el) => {
        const r = route();
        if (!r.jet) return;
        burst(el);
        if (!Store.get().saved.includes(r.jet.id)) Actions.toggleSave(r.jet.id);
      } },
      hold: { selector: '.jet-card[data-jet]', fn: (card) => quickActions(card.dataset.jet) },
    });
    render(false);
    const splash = document.getElementById('splash');
    if (splash) { splash.classList.add('gone'); setTimeout(() => splash.remove(), 400); }
    if (!Store.get().introDone) Intro.open(() => Store.set({ introDone: true }));
    else updateNotice();
    if (!Store.get().lastVersion) Store.set({ lastVersion: APP.version });
    // Offline support on the real site only (artifact frames refuse service workers).
    try {
      if ('serviceWorker' in navigator && location.protocol === 'https:' && window.self === window.top && /github\.io$/.test(location.hostname)) {
        navigator.serviceWorker.register('sw.js?v=' + APP.version).catch(() => {});
      }
    } catch (e) { /* not available here */ }
  }

  return { boot, refresh, go, applyPrefs, render, pop };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.boot);
else App.boot();
