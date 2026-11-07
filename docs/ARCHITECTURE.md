# Architecture

## Runtime
Classic scripts loaded in order (core → data → ui → features → app). Each module is an IIFE exposing one global (`Store`, `Util`, `Floorplan`, `Home`…). `App.render()` builds the current route's HTML into `#view`; one delegated click handler routes `data-act` buttons to `Actions` or settings handlers. Every data change goes through `Actions` so it gets a notice and Undo.

## Saved state (`localStorage['jettour.v1']`)
```js
{
  schema: 1,
  saved: ['global7500'],            // aircraft ids
  compare: ['g700', 'falcon8x'],    // max 3
  seats: { global7500: '3B' },      // preferred seat per aircraft
  opened: ['global7500'],           // drives the Get started checklist
  theme: 'system' | 'light' | 'dark',
  units: 'imperial' | 'metric',
  textSize: 's' | 'm' | 'l',
  introDone: true,
  checklistHidden: false,
  lastVersion: '1.0.0',             // for the one-time "Updated to version" notice
  sort: 'range', filter: 'all',
}
```
`Store.migrate()` fills defaults and repairs bad types. Backups are this object wrapped as `{ app, exported, data }`.

## Aircraft record (`js/data/fleet.js`)
```js
{
  id, maker, model, cls,                 // cls: light | midsize | supermid | large
  paxTyp, paxMax, paxNote, crew,
  rangeNm, rangeCond,                    // condition text is required: loads differ
  speedKt, mach, machIsLimit, ceilingFt,
  cabin: { l, w, h },                    // inches
  baggage, volume,                       // cu ft or null
  engines, engineCount, windows, windowsNote, eis, price: [lo, hi?],
  tp: [fields],  calc: [fields],         // third-party / converted markers
  status, berth,
  art: { len, win: 'round'|'oval', tri },// drawing proportions
  layout: { basis: 'maker'|'partial'|'class', note, zones: [{ name, desc, rows: [{L,R}|{F}] }] },
  sources: [[title, url]],
}
```
Seat ids are `<zone number><letter>` front to back, left then right (e.g. `3B`). Beds get ids but are not counted as seats.
