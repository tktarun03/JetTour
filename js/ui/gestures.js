/* Touch patterns (iOS vocabulary): zoom lock, haptic feedback, pull to refresh, swipe, double tap,
   touch and hold. All delegated at document level so re-rendered views keep working. */
const Gestures = (() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Haptic feedback: Android/Chrome vibrate. iOS Safari has no web haptics API, so this is a no-op there. */
  function haptic(ms = 8) {
    try { if (navigator.vibrate && !reduced()) navigator.vibrate(ms); } catch (e) { /* not supported */ }
  }

  /* Pinch and double-tap zoom off (the user asked for it). iOS ignores user-scalable=no, so block its
     gesture events too; trackpad pinch arrives as ctrl+wheel. Text size in More makes up for it. */
  function lockZoom() {
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
    document.addEventListener('touchmove', (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  }

  /* Pull to refresh: drag down from the top of the page past the threshold, let go. */
  function pullToRefresh(onRefresh) {
    const ind = document.getElementById('ptr');
    const TH = 78;
    let y0 = null, dy = 0, armed = false;
    const blocked = (t) => t.closest('.fp-scroll, .seat-types, .chips, .tabs, .sec-pills, .intro, .sheet-wrap, textarea, input, select');
    window.addEventListener('touchstart', (e) => {
      y0 = (window.scrollY <= 0 && e.touches.length === 1 && !blocked(e.target)) ? e.touches[0].clientY : null;
      dy = 0; armed = false;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy <= 0 || window.scrollY > 0) { ind.classList.remove('pulling', 'armed'); return; }
      ind.style.setProperty('--p', Math.min(1, dy / TH).toFixed(3));
      ind.classList.add('pulling');
      if (!armed && dy > TH) { armed = true; ind.classList.add('armed'); haptic(10); }
      if (armed && dy < TH) { armed = false; ind.classList.remove('armed'); }
    }, { passive: true });
    window.addEventListener('touchend', () => {
      if (y0 == null) return;
      ind.classList.remove('pulling', 'armed');
      if (armed) onRefresh('pull');
      y0 = null; dy = 0; armed = false;
    });
  }

  /* Swipe left/right, double tap, and touch and hold on elements matching selectors. */
  function bind({ swipe, doubleTap, hold }) {
    let sx = 0, sy = 0, st = 0, el = null, holdTimer = null, held = false, lastTap = { t: 0, el: null };
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); held = false;
      el = e.target;
      clearTimeout(holdTimer);
      const h = hold && e.target.closest(hold.selector);
      if (h) holdTimer = setTimeout(() => { held = true; haptic(14); hold.fn(h); }, 480);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (Math.abs(e.touches[0].clientX - sx) > 10 || Math.abs(e.touches[0].clientY - sy) > 10) clearTimeout(holdTimer);
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      clearTimeout(holdTimer);
      if (!el) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
      const sw = swipe && el.closest(swipe.selector);
      if (sw && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && dt < 600) { haptic(6); (dx < 0 ? swipe.left : swipe.right)(sw); el = null; return; }
      const dt2 = doubleTap && el.closest(doubleTap.selector);
      if (dt2 && Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 250) {
        if (lastTap.el === dt2 && Date.now() - lastTap.t < 320) { lastTap = { t: 0, el: null }; doubleTap.fn(dt2, t); }
        else lastTap = { t: Date.now(), el: dt2 };
      }
      el = null;
    });
    // A press that opened the hold sheet must not also follow the link underneath.
    document.addEventListener('click', (e) => { if (held) { e.preventDefault(); e.stopPropagation(); held = false; } }, true);
    document.addEventListener('contextmenu', (e) => { if (hold && e.target.closest(hold.selector)) e.preventDefault(); });
  }

  /* Tab bar minimize: shrink while scrolling down, restore on the way up. */
  function tabBarMinimize() {
    let last = window.scrollY, ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > last + 6 && y > 120) document.body.classList.add('tb-min');
        else if (y < last - 6 || y < 60) document.body.classList.remove('tb-min');
        last = y; ticking = false;
      });
    }, { passive: true });
  }

  return { haptic, lockZoom, pullToRefresh, bind, tabBarMinimize, reduced };
})();
