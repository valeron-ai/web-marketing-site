# Valeron marketing website

This repository is the canonical source for [www.valeron.ai](https://www.valeron.ai). Vercel's existing `valeron/web-marketing-site` project deploys this repository. The website has no runtime dependency on ChatGPT Sites or a downloaded ZIP.

## Edit and run locally

Use Node.js 24, matching the Vercel project.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Edit these files directly:

- `public/index.html`: homepage content and contact dialog.
- `public/style.css`: layout, responsive styles, and animations.
- `public/scene.js`: landscape rendering, tour, and driving controls.
- `public/contact.js`: contact dialog and clipboard behavior.
- `public/assets/`: images and landscape data.
- `src/app/privacy/page.tsx`: the existing privacy page.

`next.config.ts` rewrites only `/` to `public/index.html`. Keep that rewrite and the `/privacy` route when making homepage updates. Existing logos and video remain in `public/assets/`.

## Preview and publish updates

Create a branch from the latest `main`, edit the files, and validate:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Push the branch and open a pull request to `main`. The existing GitHub–Vercel integration creates a preview deployment; follow the Vercel status or preview link on the pull request. Check desktop and mobile layout, landscape animation and driving, pause/resume, contact options, and `/privacy`.

Merge the pull request into `main` to publish production. No Desktop download, ZIP upload, new token, or Vercel project is needed. `valeron.ai` redirects to `www.valeron.ai` through the existing domain configuration.

## Roll back

In [the Vercel project](https://vercel.com/valeron/web-marketing-site), use **Instant Rollback** to restore the previous successful production deployment. Preserve that deployment until the release is verified. Then revert the offending commit or pull request in GitHub so `main` matches the intended version before the next deployment.

The production deployment before the teaser migration is `GwTRVHvkaCYo2zEMwKePbzHA9tFR`, built from commit `b0057f5af5366dbd2113f56e12e828fa7bc6d53a`.
