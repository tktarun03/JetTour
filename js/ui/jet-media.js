/* Aircraft photos (AI-generated side views, cleaned by tools/process-jet-images.py).
   JetMedia.side(jet) returns an <img> for jets that have a photo, or null so callers fall back to JetArt.
   A photo that fails to load is swapped for the drawn 3/4 view (see onError). The artifact build inlines
   the photos as data URIs in JET_IMG_DATA, so the single-file page needs no image requests. */
const JetMedia = (() => {
  const HAS = new Set(['phenom300e', 'cj4gen2', 'latitude', 'praetor500', 'cl3500', 'longitude', 'g280', 'praetor600', 'global7500', 'g700', 'g800', 'falcon8x']);

  function side(jet, { eager = false, sizes = '(min-width: 900px) 460px, 92vw' } = {}) {
    if (!HAS.has(jet.id)) return null;
    const alt = Util.esc(`${jet.maker} ${jet.model}`);
    const common = `class="jet-img" width="1560" height="600" alt="${alt}" decoding="async" draggable="false" data-jet-img="${jet.id}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}`;
    // eslint-disable-next-line no-undef
    const inlined = typeof JET_IMG_DATA !== 'undefined' && JET_IMG_DATA[jet.id];
    if (inlined) return `<img src="${inlined}" ${common}>`;
    const b = `img/jets/${jet.id}-side`, v = `?v=${APP.version}`;
    return `<img src="${b}-780.webp${v}" srcset="${b}-780.webp${v} 780w, ${b}-1560.webp${v} 1560w" sizes="${sizes}" ${common}>`;
  }

  /* Drawn art when there is no photo, or as the fallback. */
  function or(jet, opts, fallback) { return side(jet, opts) || fallback(); }

  function onError(e) {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.matches('img.jet-img')) return;
    const j = FLEET_BY_ID[img.dataset.jetImg];
    if (!j) return;
    const span = document.createElement('span');
    span.className = 'jet-fallback';
    span.innerHTML = JetArt.plan(j);
    img.replaceWith(span);
  }

  return { side, or, onError, HAS };
})();
