# Strike — gh-pages (deployment branch)

⚠️ **Do not edit this branch by hand.** It holds the built, static output of the Strike
app and is what GitHub Pages serves at:

**https://brelkh.github.io/StrikeLotterySim/**

Everything here — including this README — is generated from the `main` branch on every
deploy (this file lives at `public/README.md` and Vite copies it into the build), so any
edit made directly on this branch is overwritten the next time the app is deployed.

## What the app does

- **Pick & Play** — Quick Pick, Ordinary, or System 7–12 entries; draw once and see which
  prize group you'd win.
- **Run Until Win** — choose a target prize group, optionally pick your own numbers (or
  leave them blank for a random ticket each draw), and simulate draws until you win.
  Reports total draws and total cost.
- **6/49 explainer** — tap the `6/49` badge in the header for the rules and the full
  prize-group breakdown.
- Runs entirely in the browser. Heavy simulations run in a Web Worker and determine each
  entry's prize by counting number overlap directly — no per-draw combination
  enumeration — so even System 12 → Group 1 resolves near-instantly.

## Redeploying

Work on `main`, then:

```bash
nvm use 20        # Vite 5 needs Node 18+ (the repo's default Node 16 fails the build)
npm run deploy    # builds dist/ and force-pushes it to this branch
```

Pushing to this branch automatically triggers a GitHub Pages deployment.

## Base path must match the repo name

Asset URLs are prefixed with the Vite `base` path in `vite.config.js`:

```js
base: '/StrikeLotterySim/'
```

This must equal the GitHub repository name. If the repo is renamed, update `base` and
redeploy — otherwise every asset 404s.

Source and full development docs live on the
[`main` branch](https://github.com/brelkh/StrikeLotterySim).
