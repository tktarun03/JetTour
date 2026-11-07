/* Built-in self-check: runs in CI (tests/) and on the phone from More → Run self-check. */
const SelfCheck = (() => {
  function run() {
    const out = [];
    const ok = (cond, label) => out.push([!!cond, label]);
    ok(RELEASES[0] && RELEASES[0].v === APP.version, `Release list starts at ${APP.version}`);
    const ids = new Set();
    for (const j of FLEET) {
      ok(!ids.has(j.id), `${j.id}: unique id`); ids.add(j.id);
      ok(CLASSES[j.cls], `${j.id}: known class`);
      ok(j.paxTyp <= j.paxMax, `${j.id}: typical ≤ max passengers`);
      ok(j.rangeNm > 1000 && j.rangeNm < 9000, `${j.id}: range plausible`);
      ok(j.speedKt > 400 && j.speedKt < 560, `${j.id}: speed plausible (kt, not mph)`);
      ok(j.cabin.w > j.cabin.h - 20 && j.cabin.l > j.cabin.w, `${j.id}: cabin width/height not swapped`);
      ok(j.sources.length > 0, `${j.id}: has sources`);
      let fp = null;
      try { fp = Floorplan.build(j); } catch (e) { /* reported below */ }
      ok(fp, `${j.id}: floorplan builds`);
      if (fp) {
        ok(fp.count <= j.paxMax, `${j.id}: ${fp.count} drawn seats ≤ ${j.paxMax} certified`);
        ok(fp.zoneFrac.length === j.layout.zones.length, `${j.id}: every zone measured`);
        ok(new Set(fp.seats.map((x) => x.id)).size === fp.seats.length, `${j.id}: seat ids unique`);
      }
    }
    // storage round-trip
    let storeOk = false;
    try { const k = '__jt_probe'; localStorage.setItem(k, '1'); storeOk = localStorage.getItem(k) === '1'; localStorage.removeItem(k); } catch (e) { storeOk = false; }
    ok(storeOk, 'Device storage writes and reads back');
    ok(Store.migrate({}).schema === 1 && Array.isArray(Store.migrate({ saved: 'x' }).saved), 'Migration fills defaults');
    ok(Util.esc('<b>"x"</b>') === '&lt;b&gt;&quot;x&quot;&lt;/b&gt;', 'HTML escaping');
    return out;
  }
  function summary() {
    const r = run();
    const bad = r.filter((x) => !x[0]);
    return { pass: bad.length === 0, total: r.length, failed: bad.map((x) => x[1]), lines: r };
  }
  return { run, summary };
})();
