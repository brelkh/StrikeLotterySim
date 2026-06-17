# Strike — gh-pages (deployment branch)

⚠️ **Do not edit this branch by hand.** It contains the built, static output of the
Strike app and is what GitHub Pages serves at:

**https://brelkh.github.io/StrikeLotterySim/**

## How this branch is produced

The contents here are generated from the `main` branch by Vite and published with
the `gh-pages` npm package. To redeploy, work on `main` and run:

```bash
nvm use 20        # Vite 5 requires Node 18+ (the repo's default Node 16 will fail the build)
npm run deploy    # builds dist/ and force-pushes it to this branch
```

Pushing to this branch automatically triggers a GitHub Pages deployment.

## Important: base path must match the repo name

Asset URLs are prefixed with the Vite `base` path, set in `vite.config.js`:

```js
base: '/StrikeLotterySim/'
```

This **must** equal the GitHub repository name. If the repo is renamed, update `base`
to match and redeploy — otherwise the browser requests assets from the wrong path and
every file 404s.

The source, full README, and development docs live on the [`main` branch](https://github.com/brelkh/StrikeLotterySim).
