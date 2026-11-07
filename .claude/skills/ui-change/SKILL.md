---
name: ui-change
description: Make a UI change in JetTour without breaking mobile Safari, themes, notices or tests.
---

# UI change checklist

1. Colours only from the tokens at the top of `css/app.css`; set both light and dark values.
2. Tap targets ≥ 44px, inputs ≥ 16px, no text < 11px. Use `env(safe-area-inset-*)` on anything fixed to an edge.
3. Text through `t()`; user or data text through `Util.esc`.
4. If the change alters saved data, route it through `js/features/actions.js` with a notice (+ Undo when safe).
5. Keep main controls out of the bottom ~170px on screens with the action bar, or notices will cover them.
6. Run `SHOTS=/tmp/shots node tests/flows.test.mjs` and look at the screenshots at 375, 390 and 430 widths in both themes.
