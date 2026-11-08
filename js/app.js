/* Boot, hash router, event delegation, preferences. Routes: #fleet #jet-<id> #cabin-<id> #seats-<id> #specs-<id> #compare #saved #more */
const App = (() => {
  const view = () => document.getElementById('view');
  let hostTheme = null;

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
    view().innerHTML = html;
    centreFloorplans();
    renderTabs(r);
    renderTop(s);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
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

  function refresh() { render(true); }
  function go(name) { if (location.hash === '#' + name) render(); else location.hash = name; }

  function applyPrefs() {
    const s = Store.get();
    const root = document.documentElement;
    if (s.theme === 'system') { if (hostTheme) root.setAttribute('data-theme', hostTheme); else root.removeAttribute('data-theme'); }
    else root.setAttribute('data-theme', s.theme);
    root.style.setProperty('--fs', { s: 0.92, m: 1, l: 1.12 }[s.textSize] || 1);
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
          textSize: { s: t('Text is smaller'), m: t('Text is standard size'), l: t('Text is larger') },
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
      case 'reset': More.confirmReset = true; refresh(); break;
      case 'reset-no': More.confirmReset = false; refresh(); break;
      case 'reset-yes': More.confirmReset = false; Store.reset(); applyPrefs(); refresh(); toast(t('Erased all data'), { kind: 'good', body: t('This device starts fresh') }); break;
      case 'selfcheck': {
        const r = More.runCheck(); refresh();
        toast(r.pass ? t('All checks passed') : t('{n} checks failed', { n: r.failed.length }), { kind: r.pass ? 'good' : 'bad', body: r.pass ? t('{n} checks', { n: r.total }) : r.failed[0] });
        break;
      }
      default: break;
    }
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
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', () => render(false));
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

  return { boot, refresh, go, applyPrefs, render };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.boot);
else App.boot();
