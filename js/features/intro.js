/* Skippable three-slide intro. Last button goes straight to the fleet (there is no sign-up). */
const Intro = (() => {
  function open(onDone) {
    const slides = [
      [t('Twelve real jets.'), t('From the light Phenom 300E to the 8,200 nm Gulfstream G800, with published specs and their sources.'), FLEET[0]],
      [t('Walk the cabin.'), t('Every jet has a floorplan. Tap a seat to see what it is, then make it yours.'), FLEET_BY_ID.global7500],
      [t('Compare side by side.'), t('Range, cabin and speed for up to three jets, in feet or metres.'), FLEET_BY_ID.g700],
    ];
    const el = document.createElement('div');
    el.className = 'intro';
    el.id = 'intro';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t('Welcome to {app}', { app: APP.name }));
    el.innerHTML = `<button class="link-btn skip" data-i="skip">${t('Skip')}</button>
      <div class="slides" id="intro-slides">${slides.map(([h, p, j], i) => `<section class="slide" aria-label="${i + 1} / ${slides.length}">
        <div class="art">${JetArt.side(j, { gear: i === 1, door: i === 1, tilt: i === 1 ? 0 : -6 })}</div>
        <h1 class="title" style="margin:0">${i === 0 ? `${Util.esc(APP.name)} <b>${h}</b>` : `<b>${h}</b>`}</h1><p>${p}</p></section>`).join('')}</div>
      <div class="dots">${slides.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
      <button class="next" data-i="next">${t('Next')}</button>`;
    document.body.appendChild(el);
    const sc = el.querySelector('#intro-slides');
    const dots = Array.from(el.querySelectorAll('.dots i'));
    const btn = el.querySelector('[data-i="next"]');
    const idx = () => Math.round(sc.scrollLeft / Math.max(1, sc.clientWidth));
    const sync = () => {
      const i = idx();
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      btn.textContent = i === slides.length - 1 ? t('Explore the fleet') : t('Next');
    };
    sc.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    const close = () => { el.remove(); onDone(); };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      if (b.dataset.i === 'skip') return close();
      const i = idx();
      if (i >= slides.length - 1) return close();
      sc.scrollTo({ left: (i + 1) * sc.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      setTimeout(sync, 400);
    });
  }
  return { open };
})();
