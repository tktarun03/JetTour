/* "Select Aircraft Seats": horizontal floorplan + seat-type cards + the selected seat's details. */
const Seats = (() => {
  let selected = null;     // seat id under the card (view state, not saved)
  let selectedJet = null;
  let fit = false;

  const BASIS = {
    maker: 'Manufacturer layout',
    partial: 'Partly sourced layout',
    class: 'Illustrative class layout',
  };

  function render(j, s) {
    if (selectedJet !== j.id) { selected = null; selectedJet = j.id; }
    const fp = Floorplan.build(j);
    const mine = s.seats[j.id] || null;
    const sel = (selected && fp.seats.some((x) => x.id === selected) ? selected : null) || mine || (fp.seats.find((x) => x.kind === 'recliner') || fp.seats[0]).id;
    selected = sel;
    const seat = fp.seats.find((x) => x.id === sel);
    const info = Floorplan.seatInfo(j, seat.kind);
    const zone = j.layout.zones[seat.zone];
    const isMine = mine === sel;
    const kinds = [];
    fp.seats.forEach((x) => { if (!kinds.includes(x.kind)) kinds.push(x.kind); });
    const count = (k) => fp.seats.filter((x) => x.kind === k).length;

    return `${Overview.head(j, s, 'seats', `${t('Select')} <b>${t('Aircraft Seats')}</b>`)}
      <div class="tools" style="margin:2px 0 12px"><span class="basis"><b>${t(BASIS[j.layout.basis])}</b></span></div>
      <div class="seat-grid">
        <div>
          ${Overview.fpCard(j, s, { sel, fit })}
          <div class="legend"><span><i></i>${t('Seat')}</span><span><i class="sel"></i>${t('Selected')}</span><span><i class="mine"></i>${t('Your seat')}</span></div>
          <p class="legend-note">${Util.esc(t(j.layout.note))}</p>
        </div>
        <div>
          <div class="seat-types" role="group" aria-label="${t('Seat types on this jet')}">
            ${kinds.map((k) => `<button class="seat-type" data-act="seat-kind" data-k="${k}" aria-pressed="${k === seat.kind}">
              ${Floorplan.icon(k)}<span class="nm">${Util.esc(Floorplan.seatInfo(j, k).name)}</span>
              <span class="ct">${k === 'bed' ? t('Not a seat for takeoff') : Util.plural(count(k), t('seat'), t('seats'))}</span>
              <span class="go" aria-hidden="true">${Icon.arrow}</span></button>`).join('')}
          </div>
          <div class="seat-detail glass" id="seat-card" aria-live="polite">
            <div class="eyebrow">${t('Seat')} ${Util.esc(sel)} · ${Util.esc(t(zone.name))}</div>
            <h3>${Util.esc(info.name)}</h3><p>${Util.esc(info.desc)}</p>
            ${seat.kind === 'bed' ? '' : `<button class="btn${isMine ? '' : ' primary'}" data-act="pick-seat" data-id="${j.id}" data-seat="${Util.esc(sel)}">${isMine ? t('Clear my seat') : t('Make it my seat')}</button>`}
          </div>
          <p class="legend-note">${t('{n} seats drawn · up to {m} certified.', { n: fp.count, m: j.paxMax })} ${j.paxNote ? Util.esc(t(j.paxNote)) + '.' : ''} ${t('Operators fit their own cabins, so a real aircraft may differ.')}</p>
        </div>
      </div>`;
  }

  function select(id) { selected = id; }
  function selectKind(jet, kind) {
    const fp = Floorplan.build(jet);
    const first = fp.seats.find((x) => x.kind === kind);
    if (first) selected = first.id;
  }
  function toggleFit() { fit = !fit; }
  return { render, select, selectKind, toggleFit };
})();
