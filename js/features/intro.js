/* Skippable three-slide intro on a sky gradient. Last button goes straight to the fleet (there is no sign-up). */
const Intro = (() => {
  function open(onDone) {
    const g700 = FLEET_BY_ID.g700, g7500 = FLEET_BY_ID.global7500;
    const demoCard = `<div class="jet-card sky card-demo" aria-hidden="true">
        <div><div class="pax">${g700.paxTyp}</div><div class="pax-l">${t('Passengers')}</div></div>
        <span class="go">${Icon.arrow}</span><div class="art">${JetArt.plan(g700)}</div>
        <div class="maker">${Util.esc(g700.maker)}</div><div class="model">${Util.esc(g700.model)} · ${t('Grand Suite layout')}</div></div>`;
    const seatCard = `<div class="seat-type card-demo" aria-hidden="true" style="aspect-ratio:1/1;flex:none">${Floorplan.icon('recliner')}<span class="nm">${t('Recliner')}</span><span class="go">${Icon.arrow}</span></div>`;
    const slides = [
      [`${Util.esc(APP.name)} <b>${t('Twelve real jets.')}</b>`, t('From the light Phenom 300E to the 8,200 nm Gulfstream G800, with published specs and their sources.'), demoCard],
      [`${t('Every seat,')} <b>${t('every section.')}</b>`, t('Walk the cabin section by section, tap any seat on the floorplan, then make it yours.'), seatCard],
      [`${t('Side by side,')} <b>${t('in seconds.')}</b>`, t('Range, cabin and speed for up to three jets, in feet or metres.'), `<div class="hero-art">${JetArt.side(g7500, { gear: true, door: true })}</div>`],
    ];
    const el = document.createElement('div');
    el.className = 'intro';
    el.id = 'intro';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t('Welcome to {app}', { app: APP.name }));
    el.innerHTML = `<button class="link-btn skip" data-i="skip">${t('Skip')}</button>
      <div class="slides" id="intro-slides">${slides.map(([h, p, art], i) => `<section class="slide" aria-label="${i + 1} / ${slides.length}">
        ${art}<h1 class="title" style="margin:6px 0 0">${h}</h1><p>${p}</p></section>`).join('')}</div>
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
