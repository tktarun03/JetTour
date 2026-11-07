---
name: release
description: Ship a new JetTour version - bump versions everywhere, write release notes, test, push, verify the Pages deploy, republish the artifact.
---

# Release JetTour

1. Pick the version (semver). Bug fix → patch, new feature → minor.
2. Add release notes, newest first, in both places with the same wording:
   - `RELEASES` in `js/core/releases.js`
   - `## <version> — <date>` in `CHANGELOG.md`
3. Bump the version in `js/core/config.js`, `sw.js` (`VERSION`) and every `?v=` in `index.html`:
   `sed -i 's/?v=OLD/?v=NEW/g' index.html`
4. Run `node tests/structure.test.mjs && node tests/flows.test.mjs`. Fix anything red.
5. Commit, push to `main`.
6. Verify the deploy: `gh api repos/tktarun03/JetTour/actions/runs?head_sha=<sha>` until "Tests and deploy" succeeded (both jobs).
7. Rebuild and republish the artifact mirror to the same URL: `node tools/build-artifact.mjs` then publish `dist/artifact.html`.
8. Report briefly, flaws first, with [Certain]/[Likely]/[Guessing] tags; say what was tested in a simulator vs a real phone.
