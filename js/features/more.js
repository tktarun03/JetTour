/* More: preferences, version history, backup/restore, self-check, about. (Hash is #more; #settings is reserved by the host.) */
const More = (() => {
  let checkResult = null;

  const seg = (key, cur, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="pref" data-k="${key}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;

  function render(s) {
    return `<h1 class="title">${t('More')} <b>${t('Settings')}</b></h1>
      <div class="group glass">
        <div class="set-row"><span class="k">${t('Theme')}</span>${seg('theme', s.theme, [['system', t('System')], ['light', t('Light')], ['dark', t('Dark')]])}</div>
        <div class="set-row"><span class="k">${t('Units')}</span>${seg('units', s.units, [['imperial', t('ft · nm · kt')], ['metric', t('m · km · km/h')]])}</div>
        <div class="set-row"><span class="k">${t('Text size')}</span>${seg('textSize', s.textSize, [['s', 'A−'], ['m', 'A'], ['l', 'A+'], ['xl', 'A++']])}</div>
        <div class="set-row"><span class="d">${t('Pinch to zoom is off in JetTour. Use text size to make everything bigger.')}</span></div>
        <div class="set-row inline"><span><span class="k">${t('Get started checklist')}</span><br><span class="d">${t('Shown on the fleet screen until done')}</span></span>
          <button class="btn" data-act="toggle-checklist">${s.checklistHidden ? t('Show') : t('Hide')}</button></div>
        <div class="set-row inline"><span class="k">${t('Intro tour')}</span><button class="btn" data-act="replay-intro">${t('Replay')}</button></div>
      </div>

      <h2 class="sec">${t('Your data')}</h2>
      <div class="group glass">
        <div class="set-row"><span class="k">${t('Back up')}</span><span class="d">${t('Saved jets, seats and settings live only on this device. Copy the backup and keep it somewhere safe.')}</span>
          <div class="confirm-row"><button class="btn" data-act="backup">${t('Copy backup')}</button></div>
          <textarea class="box" id="backup-box" readonly hidden aria-label="${t('Backup text')}"></textarea></div>
        <div class="set-row"><span class="k">${t('Restore')}</span><span class="d">${t('Paste a JetTour backup. This replaces what is on this device.')}</span>
          <textarea class="box" id="restore-box" placeholder="${t('Paste backup here')}" aria-label="${t('Backup to restore')}"></textarea>
          <div class="confirm-row"><button class="btn" data-act="restore">${t('Restore backup')}</button></div></div>
        <div class="set-row"><span class="k">${t('Erase everything')}</span>
          <span class="d">${t('Removes saved jets, seats and settings from this device.')}</span>
          <div class="confirm-row"><button class="btn danger" data-act="reset">${t('Erase…')}</button></div></div>
      </div>

      <h2 class="sec">${t('Version history')}</h2>
      <div class="group glass" id="versions">${RELEASES.map((r) => `<div class="rel"><h4>${t('Version')} ${Util.esc(r.v)} <span class="muted small num">${Util.esc(r.date)}</span></h4><ul>${r.notes.map((n) => `<li>${Util.esc(t(n))}</li>`).join('')}</ul></div>`).join('')}</div>

      <h2 class="sec">${t('Help')}</h2>
      <div class="group glass">
        <div class="set-row inline"><span><span class="k">${t('Self-check')}</span><br><span class="d">${t('Checks the fleet data, floorplans and storage on this device')}</span></span><button class="btn" data-act="selfcheck">${t('Run')}</button></div>
        ${checkResult ? `<div class="check-out">${Util.esc(checkResult)}</div>` : ''}
        <div class="set-row"><span class="k">${t('Install on iPhone')}</span><span class="d">${t('In Safari, tap Share, then Add to Home Screen. The Home Screen app keeps its own storage, so back up first if you have saved jets in Safari.')}</span></div>
        <div class="set-row inline"><span class="k">${t('Feedback')}</span><a class="btn" href="https://github.com/${APP.repo}/issues/new?title=${encodeURIComponent('Feedback')}&body=${encodeURIComponent('What I tried:\n\nWhat happened:\n\nApp version ' + APP.version)}" target="_blank" rel="noopener">${t('Open GitHub')}</a></div>
      </div>

      <h2 class="sec">${t('About')}</h2>
      <div class="group glass"><div class="set-row"><span class="d">${t('{app} {v} is an independent fleet guide. It is not affiliated with Bombardier, Cessna/Textron Aviation, Dassault, Embraer or Gulfstream; their names and model names belong to them. Figures come from manufacturer pages and brochures where available, otherwise from trade press and brokers (marked 3P), as of {d}. Aircraft drawings are original illustrations. Check with an operator before you book.', { app: APP.name, v: APP.version, d: APP.dataAsOf })}</span></div></div>`;
  }

  function runCheck() {
    const r = SelfCheck.summary();
    checkResult = r.pass ? `${t('All {n} checks passed.', { n: r.total })}` : `${t('{f} of {n} checks failed:', { f: r.failed.length, n: r.total })}\n• ${r.failed.join('\n• ')}`;
    return r;
  }
  return { render, runCheck };
})();
