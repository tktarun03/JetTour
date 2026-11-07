---
name: fleet-data
description: Add or correct an aircraft in JetTour's fleet data with sourced figures and an honest floorplan.
---

# Fleet data changes

1. Find the manufacturer page or brochure first. Use trade press (Aviation Week, AIN, BJT) when the maker's page can't be reached; brokers only as a last resort.
2. Watch for the known third-party errors: mph labelled as knots, statute miles as nm, cabin width/height swapped, cabin volume labelled as baggage, superseded engines.
3. Store lengths in inches, range in nm with `rangeCond` (the load it was measured at), speed in knots. Knots converted from Mach go in `calc`.
4. List every field that came from a third party in `tp`.
5. Layout: set `basis` honestly (`maker` only when zones and seat types are from the manufacturer). Seats drawn must not exceed `paxMax`. Write a `note` that says what is sourced and what is drawn by us.
6. Add each source to `sources` as `[title, url]`.
7. Run the self-check (More → Self-check) and both test files. Then follow the release skill.
