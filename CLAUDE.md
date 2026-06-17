# Strike — Claude Guide

## Project overview
Strike is an educational lottery odds simulator built as a static React + Vite SPA, deployed to GitHub Pages.
No backend. All simulation logic runs client-side; heavy loops run in a Web Worker.

## Stack
- **React 18** + **Vite 5** — SPA, no SSR
- **Vitest** + **@testing-library/react** — unit tests
- **gh-pages** — deployment to `https://brelkh.github.io/StrikeLotterySim/`

## Key files
| Path | Purpose |
|---|---|
| `src/utils/lottery.js` | All lottery game logic (draw, check, simulate). `groupForMatch()` is the single prize ladder; `runUntilWin()` is one allocation-free loop for all entry types |
| `src/workers/sim.worker.js` | Web Worker for run-until-win simulation |
| `src/components/PickNumbers.jsx` | Pick & Play tab: Quick Pick / Ordinary / System entries |
| `src/components/RunUntilWin.jsx` | Run Until Win tab: optional number picker (own ticket or random), sim loop with live counter |
| `src/components/DrawResult.jsx` | Shared result display with win/lose state and prize estimate |
| `src/components/NumberBall.jsx` | Single number ball, styled by state |
| `src/components/NumberGrid.jsx` | 7×7 clickable grid for number selection |
| `src/test/lottery.test.js` | Vitest unit tests for game logic |

## 6/49 lottery rules implemented
- Draw: 6 winning numbers + 1 additional from 1–49, all unique
- Prize groups 1–7 (Group 1 = jackpot, match 6; Group 7 = match 3)
- System entries: 7–12 numbers → C(n,6) ordinary combinations per draw
- Cost: $1 per ordinary bet; system entries cost $1 × number of combinations
- Run-until-win does **not** enumerate combinations: an entry's best prize is fully
  determined by how many of its numbers are winning numbers plus whether the additional
  is among them, so the sim counts that overlap directly (see the equivalence test in
  `lottery.test.js`). `playRound()` still enumerates combos for the Pick & Play display.
- Picking fixed numbers vs. a random ticket each draw yields identical odds — every
  specific ticket has the same win probability — so the number picker is for UX, not bias.
- The two simulations are intentionally different and should stay that way: Pick & Play
  (`playRound`) runs once and enumerates combos to surface the winning combination for the
  UI; Run Until Win (`runUntilWin`) runs millions of times and counts overlap with zero
  per-iteration allocation. Same rules core (`groupForMatch`), deliberate readability-vs-
  throughput split — don't "unify" them onto one path.

## Commands
```bash
npm run dev         # local dev server
npm run build       # production build → dist/
npm run preview     # preview the production build
npm test            # run test suite once
npm run test:watch  # watch mode
npm run deploy      # manual fallback: build + push to gh-pages branch (needs Node 18+)
```

## Deployment
Automated via GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` runs
`npm ci` → `npm test` → `npm run build` on Node 20, then force-pushes `dist/` to the
`gh-pages` branch (peaceiris/actions-gh-pages). GitHub's `pages-build-deployment` serves it.
- Don't run `npm run deploy` by hand in normal flow — pushing to `main` deploys. The script
  remains as a manual fallback (and for that, use Node 18+ since the repo default is Node 16).
- Tests gate the deploy: a failing `npm test` blocks publishing.
- `gh-pages` is fully regenerated from `dist/` each deploy, so anything that must persist on
  that branch (e.g. its README) lives in `public/` on `main` and is copied in by the build.
- GitHub one-time setup: Settings → Actions → "Read and write permissions"; Settings → Pages
  → "Deploy from a branch" → `gh-pages` (not the "GitHub Actions" Pages mode).

## Vite base path
Set to `/StrikeLotterySim/` in `vite.config.js` for GitHub Pages. Must match the GitHub repo name.

## Adding ads (Google AdSense)
1. Sign up at adsense.google.com and add the site URL
2. Insert the AdSense `<script>` tag in `index.html` (in `<head>`)
3. Add `<ins class="adsbygoogle" ...>` elements where desired in JSX
4. Static sites on GitHub Pages are fully supported by AdSense

## IP limiting
Not implemented. The app is fully static; no server cost is incurred per simulation.
If rate-limiting becomes necessary, migrate to Vercel and add middleware.

---

## Development conventions
- No comments unless the WHY is non-obvious
- No co-author lines in commits
- All design tokens live in CSS custom properties in `src/index.css`
- Prefer editing existing files over creating new ones

## After each prompt / PR — update these
1. **CLAUDE.md** — update key files table, commands, or rules if anything changed
2. **README.md** — update features list and deploy instructions if applicable
3. **src/test/lottery.test.js** — add tests for any new logic in `lottery.js` or new components
