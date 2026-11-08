/* Refresh (button in the top bar + pull to refresh): reload saved data from storage, re-render, and on the
   real site check whether a newer version is published. Loading-button pattern: spin, then a notice. */
const Refresh = (() => {
  let busy = false;
  const isSite = () => !!document.querySelector('script[src*="js/app.js"]'); // the artifact mirror is one inlined file

  async function run(source) {
    if (busy) return;
    busy = true;
    const btn = document.getElementById('top-refresh');
    const ptr = document.getElementById('ptr');
    btn && btn.classList.add('spinning');
    btn && btn.setAttribute('aria-busy', 'true');
    ptr && ptr.classList.add('loading');
    const started = Date.now();
    let latest = null, failed = false;
    try {
      if (isSite() && location.protocol.startsWith('http')) {
        const res = await fetch('js/core/config.js?check=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        latest = ((await res.text()).match(/version:\s*'([^']+)'/) || [])[1] || null;
        try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) { /* no SW here */ }
      }
    } catch (e) { failed = true; }
    const wait = 700 - (Date.now() - started); // keep the spin visible long enough to read as "done"
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    Store.load();
    App.applyPrefs();
    App.render(true);
    btn && btn.classList.remove('spinning');
    btn && btn.removeAttribute('aria-busy');
    ptr && ptr.classList.remove('loading');
    Gestures.haptic(8);
    busy = false;

    if (failed) toast(t("Couldn't check for updates"), { kind: 'bad', body: t('You may be offline. Your saved jets are safe.'), action: { label: t('Retry'), fn: () => run(source) } });
    else if (latest && latest !== APP.version) toast(t('Update ready'), { body: t('Version {v} is out. Reload to use it.', { v: latest }), action: { label: t('Reload'), fn: () => location.reload() } });
    else toast(t('Up to date'), { kind: 'good', body: t('Version {v} · fleet data {d}', { v: APP.version, d: APP.dataAsOf }) });
  }
  return { run };
})();
