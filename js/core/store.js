/* Local-only state. Nothing leaves the device. Every new field gets a default in migrate(). */
const Store = (() => {
  const KEY = 'jettour.v1';
  const DEFAULTS = {
    schema: 1,
    saved: [],          // aircraft ids
    compare: [],        // up to 3 aircraft ids
    seats: {},          // { aircraftId: seatId } preferred seat
    opened: [],         // aircraft ids viewed (drives the Get started checklist)
    theme: 'system',    // system | light | dark
    units: 'imperial',  // imperial | metric
    textSize: 'm',      // s | m | l | xl
    introDone: false,
    checklistHidden: false,
    lastVersion: null,
    sort: 'range',
    filter: 'all',
  };
  let state = clone(DEFAULTS);
  let onFail = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function migrate(d) {
    const out = Object.assign(clone(DEFAULTS), d && typeof d === 'object' ? d : {});
    for (const k of ['saved', 'compare', 'opened']) if (!Array.isArray(out[k])) out[k] = [];
    if (!out.seats || typeof out.seats !== 'object' || Array.isArray(out.seats)) out.seats = {};
    if (!['system', 'light', 'dark'].includes(out.theme)) out.theme = 'system';
    if (!['imperial', 'metric'].includes(out.units)) out.units = 'imperial';
    if (!['s', 'm', 'l', 'xl'].includes(out.textSize)) out.textSize = 'm';
    out.compare = out.compare.slice(0, 3);
    out.schema = 1;
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = migrate(raw ? JSON.parse(raw) : null);
    } catch (e) { state = migrate(null); }
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { if (onFail) onFail(e); return false; }
  }

  const get = () => state;
  function set(patch) { Object.assign(state, patch); save(); return state; }
  function exportJSON() { return JSON.stringify({ app: 'JetTour', exported: new Date().toISOString(), data: state }, null, 2); }
  function importJSON(text) {
    const parsed = JSON.parse(text);
    const data = parsed && parsed.data ? parsed.data : parsed;
    if (!data || typeof data !== 'object') throw new Error('No JetTour data in that text');
    state = migrate(data);
    save();
    return state;
  }
  function reset() { state = migrate(null); state.introDone = true; save(); return state; }

  return { load, save, get, set, migrate, exportJSON, importJSON, reset, KEY, DEFAULTS, set onFail(fn) { onFail = fn; } };
})();
