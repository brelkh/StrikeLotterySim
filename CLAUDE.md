# TotoSim — Claude Guide

## Project overview
A Singapore Toto simulator built as a static React + Vite SPA, deployed to GitHub Pages.
No backend. All simulation logic runs client-side; heavy loops run in a Web Worker.

## Stack
- **React 18** + **Vite 5** — SPA, no SSR
- **Vitest** + **@testing-library/react** — unit tests
- **gh-pages** — deployment to `https://<user>.github.io/TotoSim/`

## Key files
| Path | Purpose |
|---|---|
| `src/utils/toto.js` | All Toto game logic (draw, check, simulate) |
| `src/workers/totoSim.worker.js` | Web Worker for run-until-win simulation |
| `src/components/CheckNumbers.jsx` | Tab 1: user picks 6 numbers, runs a draw |
| `src/components/PickNumbers.jsx` | Tab 2: Quick Pick / System entry |
| `src/components/RunUntilWin.jsx` | Tab 3: runs sim until target prize group |
| `src/components/DrawResult.jsx` | Shared result display with win/lose state |
| `src/components/NumberBall.jsx` | Single number ball, styled by state |
| `src/components/NumberGrid.jsx` | 7×7 clickable grid for number selection |
| `src/test/toto.test.js` | Vitest unit tests for game logic |

## Singapore Toto rules implemented
- Draw: 6 winning numbers + 1 additional from 1–49, all unique
- Prize groups 1–7 (Group 1 = jackpot, match 6; Group 7 = match 3)
- System entries: 7–12 numbers → C(n,6) ordinary combinations per draw
- Cost: $1 per ordinary bet; system entries cost $1 × number of combinations

## Commands
```bash
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
npm test          # run test suite once
npm run test:watch  # watch mode
npm run deploy    # build + push to gh-pages branch
```

## Vite base path
Set to `/TotoSim/` in `vite.config.js` for GitHub Pages. Change this if the repo name changes.

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
- No trailing co-author lines in commits
- All design tokens live in CSS custom properties in `src/index.css`
- Prefer editing existing files over creating new ones

## After each prompt / PR — update these
1. **CLAUDE.md** — update key files table, commands, or rules if anything changed
2. **README.md** — update features list and deploy instructions if applicable
3. **src/test/toto.test.js** — add tests for any new logic in `toto.js` or new components
