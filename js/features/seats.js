/* "Select Aircraft Seats": floorplan picker with the glass seat card. */
const Seats = (() => {
  let selected = null;     // seat id under the card (view state, not saved)
  let selectedJet = null;

  const BASIS = {
    maker: 'Manufacturer layout',
    partial: 'Partly sourced layout',
    class: 'Illustrative class layout',
  };

  function render(j, s) {
    if (selectedJet !== j.id) { selected = null; selectedJet = j.id; }
    const fp = Floorplan.build(j);
    const mine = s.seats[j.id] || null;
    const sel = selected || mine || (fp.seats.find((x) => x.kind === 'recliner') || fp.seats[0]).id;
    selected = sel;
    const seat = fp.seats.find((x) => x.id === sel);
    const info = Floorplan.seatInfo(j, seat.kind);
    const zone = j.layout.zones[seat.zone];
    const isMine = mine === sel;
    return `<div class="ov-head"><h1 class="title">${t('Select')} <b>${t('Aircraft Seats')}</b></h1>
        <div class="nav"><a class="icon-btn" href="#jet-${j.id}" aria-label="${t('Back to overview')}">${Icon.back}</a></div></div>
      <div class="model-line"><div><div class="eyebrow">${Util.esc(j.maker)}</div><div class="m">${Util.esc(j.model)}</div></div>
        <span class="basis"><b>${t(BASIS[j.layout.basis])}</b></span></div>
      <p class="legend-note">${Util.esc(t(j.layout.note))}</p>
      <div class="seat-card" id="seat-card" aria-live="polite">
        ${Floorplan.icon(info.icon)}
        <div><div class="eyebrow">${t('Seat')} ${Util.esc(sel)} · ${Util.esc(t(zone.name))}</div>
          <h3>${Util.esc(info.name)}</h3><p>${Util.esc(info.desc)}</p>
          <div class="row">${seat.kind === 'bed' ? '' : `<button class="btn${isMine ? '' : ' primary'}" data-act="pick-seat" data-id="${j.id}" data-seat="${Util.esc(sel)}">${isMine ? t('Clear my seat') : t('Make it my seat')}</button>`}</div>
        </div>
      </div>
      <div class="legend"><span><i></i>${t('Seat')}</span><span><i class="sel"></i>${t('Selected')}</span><span><i class="mine"></i>${t('Your seat')}</span></div>
      <div class="fp-wrap">${fp.svg(sel, mine)}</div>
      <p class="legend-note">${t('{n} seats drawn · up to {m} certified.', { n: fp.count, m: j.paxMax })} ${j.paxNote ? Util.esc(t(j.paxNote)) + '.' : ''} ${t('Operators fit their own cabins, so a real aircraft may differ.')}</p>`;
  }

  function select(id) { selected = id; }

  return { render, select };
})();
