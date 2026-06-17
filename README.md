# ⚡ Strike

An educational lottery odds simulator — find out how lucky (or not) you'd be.

**Live demo:** `https://brelkh.github.io/StrikeLotterySim/`

---

## Features

| Tab | What it does |
|---|---|
| **Pick & Play** | Quick Pick, Ordinary, or System 7–12 (with Random auto-fill) |
| **Run Until Win** | Simulate draws until you win a target prize group; shows total draws and cost in SGD |

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
