# stakemor.com

Step-by-step guide for staking MOR tokens to earn Morpheus API credits.

## Stack

- [Astro 6](https://astro.build) (server output, Cloudflare adapter)
- Tailwind CSS 4
- Resend for email capture
- Plausible for analytics
- Vitest + happy-dom for tests

## Local development

```bash
cp .env.example .env   # fill in real values for the API to work
npm install
npm run dev            # http://localhost:4321
npm test               # unit tests
npm run build          # production build into dist/
```

## Environment variables

| Var | Where | Required |
|-----|-------|----------|
| `RESEND_API_KEY` | Resend dashboard → API Keys | yes (for /api/subscribe) |
| `RESEND_AUDIENCE_ID` | Resend → Audiences → ID | yes |
| `SUSHI_REFERRER` | Sushi referral code (defaults to `stakemor`) | no |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Plausible domain to track (e.g. `stakemor.com`) | no |

## Deployment (Cloudflare Pages)

1. Push to GitHub.
2. In Cloudflare dashboard → Workers & Pages → Connect to Git, point at the repo, and pick the `stakemor/` directory as the project root.
3. Build command: `npm run build`. Output: `dist`.
4. Add the env vars above under Settings → Environment variables.
5. Bind the custom domain `stakemor.com` under Custom domains.
6. Deploy.

## Adding a new step or path

- Edit `src/data/long-path.ts` or `src/data/short-path.ts`.
- Run `npm test` — `tests/data/paths.test.ts` will catch missing fields and bad URLs.
- Sidebar entries and step cards are generated automatically.

## Screenshots

Drop PNGs in `public/screenshots/` and reference them by `screenshot: '/screenshots/foo.png'` on the matching step.
