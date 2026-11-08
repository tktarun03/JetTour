# JetTour — notes for agents and maintainers

JetTour is a mobile-first PWA fleet guide to twelve real business jets: specs with sources, a seat-by-seat floorplan picker, cabin sections and a three-way compare. Look: thin Urbanist type (200/300/500), frosted-glass panels, dusty-blue feature cards, black pill for the active control; two-column layout at ≥900px. Plain HTML/CSS/JS, no build step, no framework, no backend. Data the user creates (saved jets, preferred seats, settings) lives only in `localStorage` on their device.

Live: GitHub Pages from `main` (https://tktarun03.github.io/JetTour/). A Claude artifact mirror is built with `node tools/build-artifact.mjs`.

## Repo map

| Path | What it is |
|---|---|
| `index.html` | Shell: top bar, `#view`, action-bar slot, tab bar, script tags in load order |
| `css/app.css` | All styles. Colour tokens at the top for light and dark |
| `js/core/` | `config.js` (APP name/version), `i18n.js` (`t()`), `util.js` (escape, units), `releases.js`, `store.js` (state, `migrate()`) |
| `js/data/fleet.js` | `CLASSES`, `FLEET`, `FLEET_BY_ID` — the aircraft data and cabin layouts |
| `js/ui/` | `icons.js`, `toast.js` (notices), `jet-art.js` (3/4-view `plan()`, side view with cutaway/hotspots, cross-section), `floorplan.js` (horizontal cabin SVG, nose left, + 3/4 seat illustrations) |
| `js/features/` | One file per screen: `home`, `overview` (shared aircraft header + Aircraft and Specs tabs), `seats`, `interior`, `compare`, `saved`, `more`, `intro`, plus `actions.js` (every data change + its notice) and `selfcheck.js` |
| `js/app.js` | Boot, hash router, click delegation, preferences, update notice, service-worker registration |
| `sw.js` | Offline cache. `VERSION` must equal `APP.version` |
| `tests/` | `structure.test.mjs` (versions, load order, name clashes), `flows.test.mjs` (Playwright flows + 3 phone sizes) |
| `docs/` | `ARCHITECTURE.md` (data shape), `research.md` (sourced spec report) |
| `tools/build-artifact.mjs` | Inlines everything into one HTML file for the Claude artifact |

## Where things are

| To change… | Edit |
|---|---|
| A spec figure | `js/data/fleet.js`, and add or keep its source in `sources`; mark third-party figures in `tp` |
| A cabin layout | `layout.zones[].rows` in `fleet.js`; module lengths in `Floorplan.LEN` (`js/ui/floorplan.js`) |
| Seat names and descriptions | `Floorplan.seatInfo` |
| Notice wording or timing | the call site in `js/features/actions.js` or `js/app.js`; behaviour in `js/ui/toast.js` |
| Routes | `App.route()` in `js/app.js` (hashes: `#fleet #jet-<id> #cabin-<id> #seats-<id> #specs-<id> #compare #saved #more`) |
| Look and feel | tokens at the top of `css/app.css` (light + two dark blocks); `.glass`, `.circle`, `.chip`, `.tabs`, `.sec-pills` are the building blocks |
| App name / white-label | `APP` in `js/core/config.js`, `manifest.webmanifest`, `<title>` in `index.html` |

## Golden rules

1. **Accuracy first.** Every figure needs a source. Prefer the manufacturer; mark third-party numbers (`tp`) and our own conversions (`calc`). Never present an illustrative floorplan as the manufacturer's (`layout.basis`).
2. **Every data change shows a notice**, with Undo when it can be put back safely (`app-toast-notices` pattern). Undo re-checks current state first.
3. **Escape everything** that goes into HTML with `Util.esc`.
4. **Every new saved field gets a default in `Store.migrate()`.** Never rename or remove a field without a migration.
5. **Release discipline:** version in `config.js` = `RELEASES[0]` = `CHANGELOG.md` = `?v=` on every asset = `sw.js VERSION`. Tests enforce it.
6. All UI text goes through `t()`. Names go in as placeholders.
7. Mobile Safari first: inputs ≥ 16px, tap targets ≥ 44px, no text < 11px, safe-area insets, no `100vh` stacks.
8. Not affiliated with any manufacturer. No manufacturer logos or artwork; aircraft drawings are generated in `jet-art.js`.

## Test

```sh
node tests/structure.test.mjs
node tests/flows.test.mjs          # SHOTS=/some/dir to save screenshots
```
CI runs both on every push (`.github/workflows/deploy.yml`); Pages deploys only after they pass.

## Release

See `.claude/skills/release/SKILL.md`.

## Sharp edges

- `#settings` is reserved by the Claude artifact host, so the settings route is `#more`.
- Artifact frames refuse service workers, `alert/confirm/prompt` and `<a download>`. Confirmations are in-page; backup is copy-to-clipboard with a visible text fallback.
- Classic scripts share one global scope. `structure.test.mjs` fails on duplicate top-level names.
- The floorplan scrolls sideways on phones; `App.centreFloorplans()` scrolls the selected seat or section into view after each render.
- Section `+` hotspots are SVG `<g data-act="zone">` inside the hero; tests target `.sec-pills` buttons to avoid ambiguity.
- `Floorplan.build` caches per aircraft id. If you edit layouts at runtime, clear the cache.
- Range figures are published under different loads (CJ4 ferry with no passengers, Longitude load unstated). Keep `rangeCond` honest.
- Seed localStorage in tests from a non-app page on the same origin (see `seed()`), or the running app overwrites it.
