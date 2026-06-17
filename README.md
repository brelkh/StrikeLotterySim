# ⚡ Strike

An educational lottery odds simulator — find out how lucky (or not) you'd be.

**Live demo:** `https://brelkh.github.io/StrikeLotterySim/`

---

## Features

| Tab | What it does |
|---|---|
| **Pick & Play** | Quick Pick, Ordinary, or System 7–12 (with Random auto-fill) |
| **Run Until Win** | Pick your own numbers (or leave blank for random) and simulate draws until you win a target prize group; shows total draws and cost in SGD |

- Tap the **6/49** badge for an in-app explainer of the rules and prize groups
- Animated win / lose results with estimated prize amounts
- System entries (7–12 numbers) with correct C(n,6) combination checking
- Approximate odds displayed for each prize group
- Live counter ticks up in real-time during long simulations
- Light / dark mode, persisted across sessions
- Runs entirely in the browser — no data sent anywhere

## 6/49 lottery rules (Singapore format)

- Pick 6 numbers from 1–49
- Each draw produces 6 winning numbers + 1 additional number
- Prize groups 1 (jackpot, match 6) through 7 (match 3)

## Running locally

```bash
git clone https://github.com/brelkh/StrikeLotterySim.git
cd StrikeLotterySim
npm install
npm run dev
```

## Running tests

```bash
npm test
```

## Deploying to GitHub Pages

1. In `vite.config.js`, confirm `base: '/StrikeLotterySim/'` matches your repo name.
2. In GitHub repo → Settings → Pages → set source to the `gh-pages` branch.
3. Then run:

```bash
npm run deploy
```

The site will be live at `https://brelkh.github.io/StrikeLotterySim/`.

## Monetisation

Static sites on GitHub Pages support Google AdSense. Sign up at adsense.google.com,
add the script tag to `index.html`, and place ad units in the JSX components.

## Disclaimer

For educational purposes only. No real money is involved.
Prize estimates are approximate and based on typical 2025 Singapore draws.

## How the two simulations differ

Pick & Play and Run Until Win both model the **same** draw (6 winning + 1 additional,
drawn uniformly from 1–49) and apply the **same** prize rules, so they always agree on
results. They differ only in how they compute them, because each has a different job:

- **Pick & Play** runs a draw **once** and needs rich detail for the UI — the drawn
  numbers, which of yours matched, and (for System entries) the exact 6-number
  combination that won. So it enumerates all `C(n,6)` combinations and checks each. That's
  "slow" (924 combos for System 12) but happens once per click in ~0.2 ms, so speed is
  irrelevant and the enumeration conveniently hands back the winning combo to highlight.

- **Run Until Win** may loop **millions** of times (~14M for a Group 1 jackpot) and needs
  only one bit per draw: did it beat the target group? So it skips enumeration entirely —
  an entry's best prize is fully determined by how many of its numbers are winning numbers
  plus whether the additional is among them, so it counts that overlap directly and reuses
  fixed arrays to avoid any per-iteration memory allocation. At that scale, those choices
  are the difference between instant and multi-second.

The lottery rules themselves are shared (`groupForMatch()` in `src/utils/lottery.js`), so
the split is a deliberate readability-vs-throughput tradeoff, not a duplication of logic.
A related consequence: picking fixed numbers vs. a random ticket each draw gives identical
odds — every specific ticket has the same win probability — so Run Until Win's number
picker is for intuition, not for changing the result.
