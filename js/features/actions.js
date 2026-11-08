/* Every action that changes saved data lives here, so each one gets a notice and (where safe) Undo. */
const Actions = (() => {
  const S = () => Store.get();
  const name = (id) => (FLEET_BY_ID[id] ? FLEET_BY_ID[id].model : id);

  function toggleSave(id) {
    const was = S().saved.includes(id);
    if (was) {
      Store.set({ saved: S().saved.filter((x) => x !== id) });
      toast(t('Removed from saved'), { body: name(id), undo: () => {
        if (!S().saved.includes(id)) Store.set({ saved: [...S().saved, id] });
        App.refresh(); toast(t('Restored {name}', { name: name(id) }), { kind: 'good' });
      } });
    } else {
      Store.set({ saved: [...S().saved, id] });
      App.pop(`[data-act="save"][data-id="${id}"], #top-saved`);
      Gestures.haptic(10);
      toast(t('Saved {name}', { name: name(id) }), { body: t('Find it under Saved'), undo: () => {
        Store.set({ saved: S().saved.filter((x) => x !== id) });
        App.refresh();
      } });
    }
    App.refresh();
  }

  function toggleCompare(id) {
    const list = S().compare;
    if (list.includes(id)) {
      const idx = list.indexOf(id);
      Store.set({ compare: list.filter((x) => x !== id) });
      toast(t('Removed from compare'), { body: name(id), undo: () => {
        const now = S().compare;
        if (!now.includes(id) && now.length < 3) { const next = now.slice(); next.splice(Math.min(idx, next.length), 0, id); Store.set({ compare: next }); }
        App.refresh();
      } });
    } else if (list.length >= 3) {
      toast(t('Compare is full'), { kind: 'bad', body: t('Remove one of the three first'), action: { label: t('Open'), fn: () => App.go('compare') } });
      return;
    } else {
      Store.set({ compare: [...list, id] });
      App.pop(`[data-act="compare"][data-id="${id}"], #top-compare, #accessory`);
      Gestures.haptic(8);
      const n = list.length + 1;
      toast(t('Added to compare'), { body: `${n} ${t('of')} 3 · ${name(id)}`, undo: () => {
        Store.set({ compare: S().compare.filter((x) => x !== id) });
        App.refresh();
      } });
    }
    App.refresh();
  }

  function clearCompare() {
    const prev = S().compare.slice();
    if (!prev.length) return;
    Store.set({ compare: [] });
    toast(t('Cleared compare list'), { body: Util.plural(prev.length, t('aircraft'), t('aircraft')), undo: () => {
      if (!S().compare.length) Store.set({ compare: prev });
      App.refresh();
    } });
    App.refresh();
  }

  function setSeat(jetId, seatId) {
    const prev = S().seats[jetId] || null;
    const seats = Object.assign({}, S().seats);
    if (prev === seatId) {
      delete seats[jetId];
      Store.set({ seats });
      toast(t('Cleared your seat'), { body: `${name(jetId)} · ${t('Seat')} ${seatId}`, undo: () => {
        if (!S().seats[jetId]) Store.set({ seats: Object.assign({}, S().seats, { [jetId]: seatId }) });
        App.refresh();
      } });
    } else {
      seats[jetId] = seatId;
      Store.set({ seats });
      App.pop(`.fp-seat[data-seat="${seatId}"], [data-act="pick-seat"]`);
      Gestures.haptic(10);
      toast(t('Seat {id} is now yours', { id: seatId }), { body: name(jetId) + (prev ? ` · ${t('was')} ${prev}` : ''), undo: () => {
        if (S().seats[jetId] === seatId) {
          const s = Object.assign({}, S().seats);
          if (prev) s[jetId] = prev; else delete s[jetId];
          Store.set({ seats: s });
        }
        App.refresh();
      } });
    }
    App.refresh();
  }

  function setPref(key, value, label) {
    const prev = S()[key];
    if (prev === value) return;
    Store.set({ [key]: value });
    App.applyPrefs();
    toast(label, { undo: () => { Store.set({ [key]: prev }); App.applyPrefs(); App.refresh(); } });
    App.refresh();
  }

  function markOpened(id) {
    if (!S().opened.includes(id)) Store.set({ opened: [...S().opened, id] });
  }

  return { toggleSave, toggleCompare, clearCompare, setSeat, setPref, markOpened };
})();
