# JetTour

A phone-first guide to twelve real business jets, from the Embraer Phenom 300E to the Gulfstream G800.

- **Fleet:** filter by class and sort by range, passengers, cabin or speed
- **Overview:** key numbers, a cabin cross-section to scale, full specs with sources
- **Seats:** a top-down floorplan; tap any seat to see what it is and make it yours
- **Interior:** walk the cabin section by section
- **Compare:** up to three jets side by side, in imperial or metric
- Save favourites, Undo on every change, light/dark theme, backup and restore, works offline once installed

Live: https://tktarun03.github.io/JetTour/

## Data
Specs come from manufacturer pages and brochures where available, otherwise trade press, as of November 2026. Third-party figures are marked **3P** in the app, and our own conversions are marked **≈**. Every floorplan says whether it comes from the manufacturer or is an illustration. See [docs/research.md](docs/research.md).

JetTour is an independent guide, not affiliated with Bombardier, Cessna/Textron Aviation, Dassault, Embraer or Gulfstream. Aircraft drawings are original illustrations.

## Develop
No build step. Serve the folder (`python3 -m http.server`) and open it. Tests: `node tests/structure.test.mjs && node tests/flows.test.mjs`. See [AGENTS.md](AGENTS.md).
