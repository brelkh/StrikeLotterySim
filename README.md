# TotoSim

A Toto simulator — see how lucky (or not) you'd be.

**Live demo:** `https://<your-github-username>.github.io/TotoSim/`

---

## Features

| Tab | What it does |
|---|---|
| **Check Numbers** | Pick your 6 numbers, run a draw, see what you matched |
| **Pick & Play** | Choose Quick Pick, System 7–12, or Ordinary; run a draw |
| **Run Until Win** | Simulate draws until you win a target prize group; shows total draws and cost in SGD |

- Animated win / lose results
- System entries (7–12 numbers) with correct C(n,6) combination checking
- Approximate odds displayed for each prize group
- Runs entirely in the browser — no data sent anywhere

## Toto rules

- Pick 6 numbers from 1–49
- Each draw produces 6 winning numbers + 1 additional number
- Prize groups 1 (jackpot, match 6) through 7 (match 3)

## Running locally

```bash
git clone https://github.com/<your-username>/TotoSim.git
cd TotoSim
npm install
npm run dev
```

## Running tests

```bash
npm test
```

## Deploying to GitHub Pages

1. In `vite.config.js`, confirm `base: '/TotoSim/'` matches your repo name.
2. In `package.json`, the `deploy` script runs `gh-pages -d dist`.
3. In your GitHub repo → Settings → Pages → set source to the `gh-pages` branch.
4. Then run:

```bash
npm run deploy
```

The site will be live at `https://<your-username>.github.io/TotoSim/`.

## Monetisation

Static sites on GitHub Pages support Google AdSense. Sign up at adsense.google.com,
add the script tag to `index.html`, and place ad units in the JSX components.

## Disclaimer

For entertainment only. Toto is operated by [Singapore Pools](https://www.singaporepools.com.sg).
Please gamble responsibly.
