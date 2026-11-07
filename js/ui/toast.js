/* Bottom notice, BasKar pattern. One at a time; a new one replaces the old.
   toast(title) · toast(title,{kind:'good'|'bad', body}) · toast(title,{body, undo:fn}) · toast(title,{body, action:{label,fn}}) */
const Toast = (() => {
  const ICON = {
    good: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };
  let el = null, timer = null, remaining = 0, startedAt = 0, current = null;

  function ensure() {
    if (el) return el;
    el = document.createElement('div');
    el.className = 'toast';
    el.id = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);
    el.addEventListener('click', onClick);
    document.body.appendChild(el);
    return el;
  }

  function show(title, opts = {}) {
    ensure();
    clearTimeout(timer);
    const kind = opts.kind || null;
    const btn = opts.undo ? { label: t('Undo'), fn: opts.undo } : opts.action || null;
    current = { btn };
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.setAttribute('role', kind === 'bad' ? 'alert' : 'status');
    el.innerHTML =
      (kind ? `<span class="ti">${ICON[kind]}</span>` : '') +
      `<span class="tx"><strong>${Util.esc(title)}</strong>${opts.body ? `<span>${Util.esc(opts.body)}</span>` : ''}</span>` +
      (btn ? `<button type="button" class="tb" data-t="act">${Util.esc(btn.label)}</button>` : '') +
      `<button type="button" class="tx-x" data-t="x" aria-label="${Util.esc(t('Dismiss'))}">${ICON.x}</button>`;
    // force reflow so the slide-up runs even when replacing
    void el.offsetWidth;
    el.classList.add('show');
    remaining = btn ? 7000 : kind === 'bad' ? 6000 : 4500;
    startedAt = Date.now();
    timer = setTimeout(hide, remaining);
  }

  function hide() { clearTimeout(timer); if (el) el.classList.remove('show'); current = null; }
  function pause() { if (!current) return; clearTimeout(timer); remaining -= Date.now() - startedAt; }
  function resume() { if (!current) return; startedAt = Date.now(); clearTimeout(timer); timer = setTimeout(hide, Math.max(1200, remaining)); }

  function onClick(e) {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.t === 'act' && current && current.btn) { const fn = current.btn.fn; hide(); fn(); }
    else if (b.dataset.t === 'x') hide();
  }
  return { show, hide };
})();
function toast(title, opts) { Toast.show(title, opts); }
