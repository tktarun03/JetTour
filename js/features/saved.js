/* Saved aircraft and preferred seats. */
const Saved = (() => {
  function render(s) {
    const items = s.saved.map((id) => FLEET_BY_ID[id]).filter(Boolean);
    const seats = Object.entries(s.seats).filter(([id]) => FLEET_BY_ID[id]);
    const head = `<h1 class="title">${t('Your')} <b>${t('Saved Jets')}</b></h1>`;
    const seatList = seats.length ? `<h2 class="sec">${t('Your seats')}</h2><div class="spec-list glass">${seats.map(([id, seat]) => `<div class="spec-row"><a class="k" href="#seats-${id}">${Util.esc(FLEET_BY_ID[id].model)}</a><span class="v">${t('Seat')} ${Util.esc(seat)}</span></div>`).join('')}</div>` : '';
    if (!items.length) {
      return `${head}<div class="empty glass">${JetArt.plan(FLEET[0])}<h3>${t('No saved jets yet')}</h3>
        <p>${t('Open any aircraft and tap the heart next to its name. Saved jets stay on this device.')}</p>
        <a class="btn primary" href="#fleet">${t('Browse the fleet')}</a></div>${seatList}`;
    }
    return `${head}<div class="cards">${items.map((j, i) => Home.card(j, i, s)).join('')}</div>${seatList}`;
  }
  return { render };
})();
