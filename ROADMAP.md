# Roadmap

## Next
- Get real manufacturer floorplans (Embraer, Textron, Gulfstream brochures) and upgrade layouts from `class`/`partial` to `maker`
- Fill gaps: Phenom 300E official cabin width/height, Global 7500 baggage and cabin volume, Latitude and Longitude in-service year
- Test on a real iPhone (Home Screen install, Safari storage) and with 3–5 real users
- Add the Global 8000, Falcon 6X and G300 once in service, with sourced figures

## Later
- Translations (table in `js/core/i18n.js`), including right-to-left
- Share an aircraft (share sheet → clipboard → copy box) and a QR code
- Day/night cabin views (beds made up)

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-11-07 | Fleet showcase, not booking | User's choice; no backend, no payments, no personal data |
| 2026-11-07 | Original brand "JetTour", no manufacturer logos | Reference video was a manufacturer-branded concept; we must not imitate a real brand |
| 2026-11-07 | Real aircraft with sourced specs | User asked for real models; accuracy over round marketing numbers |
| 2026-11-07 | G800 instead of G650ER | G650ER left production Feb 2025 and its official spec page is gone |
| 2026-11-07 | Keep G280 with a "being replaced" label | Still the type flying in charter fleets; G300 figures are preliminary |
| 2026-11-07 | Label every floorplan's basis | No maker publishes seat-by-seat floorplans in text; most layouts are illustrative |
| 2026-11-07 | No sign-up, password or encryption | Nothing sensitive is stored; local favourites and settings only |
| 2026-11-07 | English only for v1, all strings through `t()` | Cheap to add languages later |
