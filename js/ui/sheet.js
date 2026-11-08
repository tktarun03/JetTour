/* Action sheet: slides up from the bottom, drag down or tap outside to dismiss, Esc closes.
   Sheet.open({ title, body, actions: [{ label, kind: 'danger'|'primary'|'', fn }], cancel }) */
const Sheet = (() => {
  let wrap = null, lastFocus = null;

  function open({ title, body, actions = [], cancel = t('Cancel') }) {
    close(true);
    lastFocus = document.activeElement;
    wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `<div class="sheet-bg" data-sh="bg"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${Util.esc(title)}">
        <div class="sheet-grab" aria-hidden="true"></div>
        <div class="sheet-group">
          <div class="sheet-head"><strong>${Util.esc(title)}</strong>${body ? `<span>${Util.esc(body)}</span>` : ''}</div>
          ${actions.map((a, i) => `<button type="button" class="sheet-btn ${a.kind || ''}" data-sh="a" data-k="${i}">${Util.esc(a.label)}</button>`).join('')}
        </div>
        <button type="button" class="sheet-btn cancel" data-sh="x">${Util.esc(cancel)}</button>
      </div>`;
    document.body.appendChild(wrap);
    void wrap.offsetWidth;
    wrap.classList.add('show');
    document.body.classList.add('sheet-open');
    const panel = wrap.querySelector('.sheet');
    (wrap.querySelector('.sheet-btn') || panel).focus();

    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sh]');
      if (!b) return;
      if (b.dataset.sh === 'a') { const fn = actions[Number(b.dataset.k)].fn; close(); fn(); }
      else close();
    });
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // keep focus inside the sheet
        const f = Array.from(panel.querySelectorAll('button'));
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    // swipe to dismiss
    let y0 = null, dy = 0;
    panel.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; dy = 0; panel.style.transition = 'none'; }, { passive: true });
    panel.addEventListener('touchmove', (e) => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = `translateY(${dy}px)`; }, { passive: true });
    panel.addEventListener('touchend', () => { panel.style.transition = ''; if (dy > 90) close(); else panel.style.transform = ''; y0 = null; });
  }

  function close(instant) {
    if (!wrap) return;
    const w = wrap;
    wrap = null;
    document.body.classList.remove('sheet-open');
    if (instant || Gestures.reduced()) w.remove();
    else { w.classList.remove('show'); setTimeout(() => w.remove(), 260); }
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* gone */ }
  }

  return { open, close, isOpen: () => !!wrap };
})();
