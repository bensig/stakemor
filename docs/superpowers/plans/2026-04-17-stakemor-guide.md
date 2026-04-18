# stakemor.com Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the stakemor.com Phase 1 single-page guide that walks ETH-holders through staking MOR on Base for Morpheus API credits.

**Architecture:** Astro static site with islands for the interactive amount picker, scroll-spy sidebar, and email capture form. One single-page route (`/`) with content-driven step cards generated from typed data files. Server-side endpoint at `/api/subscribe` for Resend. Plausible for analytics. Deployed to Cloudflare Pages.

**Tech Stack:** Astro 6, Tailwind CSS 4, TypeScript, Vitest + happy-dom for unit/component tests, Resend for email capture, Plausible for analytics, Cloudflare Pages for hosting.

**Spec:** `docs/superpowers/specs/2026-04-17-stakemor-guide-design.md`

---

## File Structure

```
stakemor/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── .gitignore
├── README.md
├── public/
│   ├── favicon.svg
│   ├── og-image.png            # placeholder until designed
│   └── screenshots/            # destination-tool screenshots, populated post-launch
├── src/
│   ├── env.d.ts
│   ├── styles/
│   │   └── global.css          # Tailwind base + design tokens
│   ├── lib/
│   │   ├── urls.ts             # URL builders (Sushi referral, bridges)
│   │   ├── analytics.ts        # Plausible event helpers
│   │   └── subscribe.ts        # Resend client wrapper
│   ├── data/
│   │   ├── types.ts            # Step + Path types
│   │   ├── long-path.ts        # Long-path step data (5 steps)
│   │   ├── short-path.ts       # Short-path step data (4 steps)
│   │   └── faq.ts              # FAQ entries
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── AmountPicker.astro     # client island
│   │   ├── PathSidebar.astro      # client island
│   │   ├── StepCard.astro
│   │   ├── PathSection.astro
│   │   ├── EmailCapture.astro     # client island
│   │   ├── FAQ.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro
│   └── pages/
│       ├── index.astro
│       └── api/
│           └── subscribe.ts
└── tests/
    ├── lib/
    │   ├── urls.test.ts
    │   └── subscribe.test.ts
    ├── data/
    │   └── paths.test.ts
    └── api/
        └── subscribe.endpoint.test.ts
```

**Boundaries:**
- `src/lib/` — pure functions, no Astro/DOM. Easy to TDD.
- `src/data/` — typed content. Tested for shape completeness.
- `src/components/` — Astro components, mostly content. Visual review > unit tests.
- `src/pages/api/` — server endpoints. TDD'd.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/env.d.ts`

- [ ] **Step 1: Initialize Astro project**

Run from the project root (`/Users/nobi/Projects/web/Morpheus-Gateway`):

```bash
npm create astro@latest stakemor -- --template minimal --typescript strict --install --no-git --skip-houston
cd stakemor
```

- [ ] **Step 2: Add dependencies**

```bash
npm install @astrojs/cloudflare @tailwindcss/vite tailwindcss resend
npm install -D vitest @vitest/coverage-v8 happy-dom
```

- [ ] **Step 3: Write `astro.config.mjs`**

Replace contents:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stakemor.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

> **Note:** the original draft of this task used `getViteConfig` from `astro/config` to wrap the Vitest config. That breaks because `@cloudflare/vite-plugin` (loaded by the Cloudflare adapter) refuses Vitest's environment options. Pure-function unit tests don't need the Astro wrapper, so we use bare Vitest config. If we ever add Astro component tests, set up a separate `vitest.astro.config.ts` with the wrapper.

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
.astro/
.wrangler/
.env
.env.local
.DS_Store
coverage/
```

- [ ] **Step 6: Write `.env.example`**

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_AUDIENCE_ID=00000000-0000-0000-0000-000000000000
SUSHI_REFERRER=stakemor
PUBLIC_PLAUSIBLE_DOMAIN=stakemor.com
```

- [ ] **Step 7: Update `package.json` scripts**

Edit `package.json` so the `scripts` block reads:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "astro check"
}
```

- [ ] **Step 8: Verify scaffold builds**

Run: `cd stakemor && npm run build`
Expected: build succeeds (Astro generates `dist/` with the default minimal page).

- [ ] **Step 9: Commit**

```bash
cd /Users/nobi/Projects/web/Morpheus-Gateway
git init -b main
git add stakemor docs
git commit -m "chore: scaffold stakemor Astro project with Tailwind, Vitest, Cloudflare adapter"
```

---

## Task 2: Design Tokens & Global Styles

**Files:**
- Create: `stakemor/src/styles/global.css`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-card: #1a1a1a;
  --color-border: #262626;
  --color-text: #f5f5f5;
  --color-text-muted: #a3a3a3;
  --color-text-dim: #737373;
  --color-mor: #22c55e;
  --color-mor-hover: #16a34a;
  --color-mor-dim: rgba(34, 197, 94, 0.12);

  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}

html {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background: var(--color-bg);
}

a { color: var(--color-mor); text-decoration: none; }
a:hover { color: var(--color-mor-hover); }

::selection { background: var(--color-mor-dim); color: var(--color-mor); }
```

- [ ] **Step 2: Verify tokens are picked up by Tailwind**

Open `src/pages/index.astro` (the default minimal page) and add `class="bg-bg text-mor"` to the `<h1>`.
Run: `npm run dev`
Expected: page renders dark with green text.
Revert the test change after confirming.

- [ ] **Step 3: Commit**

```bash
git add stakemor/src
git commit -m "feat: add design tokens matching mor.org dark + green palette"
```

---

## Task 3: URL Builder Library (TDD)

**Files:**
- Create: `stakemor/tests/lib/urls.test.ts`
- Create: `stakemor/src/lib/urls.ts`

- [ ] **Step 1: Write the failing tests**

Create `stakemor/tests/lib/urls.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  sushiSwapUrl,
  superbridgeUrl,
  morBridgeUrl,
  morBuildersUrl,
  morBillingUrl,
} from '../../src/lib/urls';

describe('sushiSwapUrl', () => {
  it('builds a cross-chain ETH-mainnet → MOR-Arbitrum URL with referrer', () => {
    const url = sushiSwapUrl({
      fromChain: 1,
      toChain: 42161,
      fromToken: 'NATIVE',
      toToken: '0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86',
      referrer: 'stakemor',
    });
    expect(url).toContain('https://www.sushi.com/swap');
    expect(url).toContain('chainId=1');
    expect(url).toContain('toChainId=42161');
    expect(url).toContain('referrer=stakemor');
    expect(url).toContain(
      'token1=0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86',
    );
  });

  it('builds a same-chain Base swap URL', () => {
    const url = sushiSwapUrl({
      fromChain: 8453,
      toChain: 8453,
      fromToken: 'NATIVE',
      toToken: '0x7431ada8a591c955a994a21710752ef9b882b8e3',
      referrer: 'stakemor',
    });
    expect(url).toContain('chainId=8453');
    expect(url).toContain('toChainId=8453');
    expect(url).toContain('referrer=stakemor');
  });

  it('throws if referrer is empty', () => {
    expect(() =>
      sushiSwapUrl({
        fromChain: 1,
        toChain: 42161,
        fromToken: 'NATIVE',
        toToken: '0xabc',
        referrer: '',
      }),
    ).toThrow(/referrer/i);
  });
});

describe('superbridgeUrl', () => {
  it('points at the Base bridge route', () => {
    expect(superbridgeUrl()).toBe('https://superbridge.app/base');
  });
});

describe('morBridgeUrl', () => {
  it('points at the MOR bridge dashboard', () => {
    expect(morBridgeUrl()).toBe(
      'https://dashboard.mor.org/bridge-mor?network=Base',
    );
  });
});

describe('morBuildersUrl', () => {
  it('links to the builders list filtered to Base, sorted by stake', () => {
    expect(morBuildersUrl()).toBe(
      'https://dashboard.mor.org/builders?sort=totalStaked-desc&network=Base',
    );
  });
});

describe('morBillingUrl', () => {
  it('points at the app.mor.org billing page', () => {
    expect(morBillingUrl()).toBe('https://app.mor.org/billing');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `cd stakemor && npm test -- urls`
Expected: FAIL with "cannot find module '../../src/lib/urls'".

- [ ] **Step 3: Write the minimal implementation**

Create `stakemor/src/lib/urls.ts`:

```typescript
export interface SushiSwapParams {
  fromChain: number;
  toChain: number;
  fromToken: string; // 'NATIVE' or 0x... address
  toToken: string;
  referrer: string;
}

export function sushiSwapUrl(p: SushiSwapParams): string {
  if (!p.referrer) {
    throw new Error('sushiSwapUrl: referrer is required');
  }
  const params = new URLSearchParams({
    chainId: String(p.fromChain),
    toChainId: String(p.toChain),
    token0: p.fromToken,
    token1: p.toToken,
    referrer: p.referrer,
  });
  return `https://www.sushi.com/swap?${params.toString()}`;
}

export function superbridgeUrl(): string {
  return 'https://superbridge.app/base';
}

export function morBridgeUrl(): string {
  return 'https://dashboard.mor.org/bridge-mor?network=Base';
}

export function morBuildersUrl(): string {
  return 'https://dashboard.mor.org/builders?sort=totalStaked-desc&network=Base';
}

export function morBillingUrl(): string {
  return 'https://app.mor.org/billing';
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `cd stakemor && npm test -- urls`
Expected: PASS, 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add stakemor/src/lib/urls.ts stakemor/tests/lib/urls.test.ts
git commit -m "feat: add URL builders for Sushi referral, MOR dashboard, superbridge"
```

---

## Task 4: Path Data Files

**Files:**
- Create: `stakemor/src/data/types.ts`
- Create: `stakemor/src/data/long-path.ts`
- Create: `stakemor/src/data/short-path.ts`
- Create: `stakemor/tests/data/paths.test.ts`

- [ ] **Step 1: Write `src/data/types.ts`**

```typescript
export interface Step {
  number: number;
  title: string;
  blurb: string;          // 1–2 sentence "what & why"
  ctaLabel: string;       // button text, e.g. "Open Sushi"
  ctaHref: string;        // outbound URL
  successCriterion: string; // "what success looks like"
  gotcha?: string;        // optional foot-gun callout
  screenshot?: string;    // /screenshots/foo.png — optional, populated later
}

export interface Path {
  id: 'long' | 'short';
  label: string;
  amountHint: string;
  steps: Step[];
}
```

- [ ] **Step 2: Write `src/data/long-path.ts`**

> **Verify before launch:** the MOR-on-Arbitrum address below (`0x092baadb...`) and the MOR-on-Base address used in `short-path.ts` (`0x7431ada8...`) come from public sources but were not double-checked at plan time. Open the resulting Sushi link in a browser, confirm the destination token shows the correct "MOR" name and matches Morpheus' published contract addresses, and update the constants if needed before deploy.

```typescript
import type { Path } from './types';
import {
  sushiSwapUrl,
  morBridgeUrl,
  superbridgeUrl,
  morBuildersUrl,
  morBillingUrl,
} from '../lib/urls';

const REFERRER = import.meta.env.SUSHI_REFERRER ?? 'stakemor';

const MOR_ARBITRUM = '0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86';

export const longPath: Path = {
  id: 'long',
  label: 'Any amount (recommended)',
  amountHint: 'Best pricing. Works for any size stake.',
  steps: [
    {
      number: 1,
      title: 'Swap ETH → MOR (cross-chain, one transaction)',
      blurb:
        'SushiSwap can move your ETH from Ethereum mainnet to MOR on Arbitrum in a single transaction. No manual bridge step.',
      ctaLabel: 'Open SushiSwap',
      ctaHref: sushiSwapUrl({
        fromChain: 1,
        toChain: 42161,
        fromToken: 'NATIVE',
        toToken: MOR_ARBITRUM,
        referrer: REFERRER,
      }),
      successCriterion:
        "Your wallet's Arbitrum MOR balance shows the new tokens (may take 1–3 minutes).",
      gotcha:
        'Set slippage to 1% if the default fails. The swap+bridge happens in one transaction so the gas estimate looks high — that is normal.',
    },
    {
      number: 2,
      title: 'Bridge MOR from Arbitrum to Base',
      blurb:
        'The Morpheus staking subnet lives on Base. Use the official mor.org bridge to move MOR over.',
      ctaLabel: 'Open MOR Bridge',
      ctaHref: morBridgeUrl(),
      successCriterion: 'Your Base MOR balance updates after about a minute.',
      gotcha: 'You will pay gas on Arbitrum (a few cents) for this bridge.',
    },
    {
      number: 3,
      title: 'Get a tiny amount of ETH on Base for gas',
      blurb:
        'Staking is a transaction on Base, so your wallet needs Base ETH to pay gas (~$0.50). Most people skip this and get stuck — do it now.',
      ctaLabel: 'Open Superbridge',
      ctaHref: superbridgeUrl(),
      successCriterion:
        'Bridge ~$2 of ETH from Ethereum to Base. You see the Base ETH appear in your wallet.',
      gotcha:
        'Skip this if you already have any ETH on Base. You only need enough to cover one transaction.',
    },
    {
      number: 4,
      title: 'Stake on the Morpheus Marketplace API subnet',
      blurb:
        'Click "Builders" in the sidebar — yes, even though you are a staker. The page that opens lists subnets you can stake into. Find "Morpheus Marketplace API" and click Stake.',
      ctaLabel: 'Open Builders Dashboard',
      ctaHref: morBuildersUrl(),
      successCriterion:
        'Your stake shows in "Your Position" on the subnet page. Lock period is 7 days.',
      gotcha:
        'The minimum is 0.001 MOR but realistic API credits start kicking in around 50–100 MOR depending on subnet rates.',
    },
    {
      number: 5,
      title: 'Link your wallet to your app.mor.org account',
      blurb:
        'Without this step your stake earns nothing useful — the wallet has to be linked to your app account so the daily API credits land in the right place.',
      ctaLabel: 'Open Billing',
      ctaHref: morBillingUrl(),
      successCriterion:
        'Your wallet shows under "Linked Wallets" and Daily Allowance updates within 24 hours.',
      gotcha:
        'Daily credits refresh at midnight UTC. If you just staked, you may not see credits until the next refresh.',
    },
  ],
};
```

- [ ] **Step 3: Write `src/data/short-path.ts`**

```typescript
import type { Path } from './types';
import {
  superbridgeUrl,
  sushiSwapUrl,
  morBuildersUrl,
  morBillingUrl,
} from '../lib/urls';

const REFERRER = import.meta.env.SUSHI_REFERRER ?? 'stakemor';

const MOR_BASE = '0x7431ada8a591c955a994a21710752ef9b882b8e3';

export const shortPath: Path = {
  id: 'short',
  label: 'Small stakes only (< $500)',
  amountHint:
    'Fewer steps. Base MOR liquidity is thin so slippage gets ugly past ~1 ETH worth.',
  steps: [
    {
      number: 1,
      title: 'Bridge ETH to Base',
      blurb:
        'Move enough ETH from Ethereum mainnet to Base to cover both your swap amount and ~$1 of gas.',
      ctaLabel: 'Open Superbridge',
      ctaHref: superbridgeUrl(),
      successCriterion: 'Your Base ETH balance reflects the bridged amount.',
    },
    {
      number: 2,
      title: 'Swap ETH → MOR on Base',
      blurb:
        'Use SushiSwap on Base to swap your bridged ETH into MOR.',
      ctaLabel: 'Open SushiSwap (Base)',
      ctaHref: sushiSwapUrl({
        fromChain: 8453,
        toChain: 8453,
        fromToken: 'NATIVE',
        toToken: MOR_BASE,
        referrer: REFERRER,
      }),
      successCriterion: 'Base MOR balance shows up in your wallet.',
      gotcha:
        'Watch the slippage warning. If it shows >2% on a small swap, the pool is congested — wait or use the long path.',
    },
    {
      number: 3,
      title: 'Stake on the Morpheus Marketplace API subnet',
      blurb:
        'Click "Builders" in the sidebar (yes, even though you are a staker). Find "Morpheus Marketplace API" and click Stake.',
      ctaLabel: 'Open Builders Dashboard',
      ctaHref: morBuildersUrl(),
      successCriterion:
        'Your stake shows in "Your Position" on the subnet page. Lock period is 7 days.',
    },
    {
      number: 4,
      title: 'Link your wallet to your app.mor.org account',
      blurb:
        'Required so your stake earns API credits in your account.',
      ctaLabel: 'Open Billing',
      ctaHref: morBillingUrl(),
      successCriterion:
        'Your wallet shows under "Linked Wallets" and Daily Allowance updates within 24 hours.',
    },
  ],
};
```

- [ ] **Step 4: Write the data shape test**

Create `stakemor/tests/data/paths.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { longPath } from '../../src/data/long-path';
import { shortPath } from '../../src/data/short-path';

describe('path data', () => {
  it('long path has 5 sequentially-numbered steps', () => {
    expect(longPath.steps).toHaveLength(5);
    longPath.steps.forEach((s, i) => expect(s.number).toBe(i + 1));
  });

  it('short path has 4 sequentially-numbered steps', () => {
    expect(shortPath.steps).toHaveLength(4);
    shortPath.steps.forEach((s, i) => expect(s.number).toBe(i + 1));
  });

  it.each([longPath, shortPath])(
    '$id path has every required field on every step',
    (path) => {
      for (const step of path.steps) {
        expect(step.title).toBeTruthy();
        expect(step.blurb.length).toBeGreaterThan(20);
        expect(step.ctaLabel).toBeTruthy();
        expect(step.ctaHref).toMatch(/^https:\/\//);
        expect(step.successCriterion).toBeTruthy();
      }
    },
  );

  it('every Sushi link includes the referrer param', () => {
    const allSteps = [...longPath.steps, ...shortPath.steps];
    const sushiSteps = allSteps.filter((s) =>
      s.ctaHref.includes('sushi.com'),
    );
    expect(sushiSteps.length).toBeGreaterThan(0);
    sushiSteps.forEach((s) => expect(s.ctaHref).toContain('referrer='));
  });
});
```

- [ ] **Step 5: Run tests — verify they pass**

Run: `cd stakemor && npm test`
Expected: PASS for both `urls.test.ts` and `paths.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add stakemor/src/data stakemor/tests/data
git commit -m "feat: add typed step data for long and short staking paths"
```

---

## Task 5: Base Layout

**Files:**
- Create: `stakemor/src/layouts/Base.astro`
- Create: `stakemor/src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Footer.astro`**

```astro
---
---
<footer class="border-t border-[var(--color-border)] mt-24 py-8 px-6 text-center text-sm text-[var(--color-text-dim)]">
  <p>
    Independent guide. Not affiliated with Morpheus AI or the Morpheus Foundation.
  </p>
  <p class="mt-2">
    Source on
    <a href="https://github.com/stakemor/site" class="underline">GitHub</a>
    · Built by users tired of confusing crypto UX.
  </p>
</footer>
```

- [ ] **Step 2: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Footer from '../components/Footer.astro';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'stakemor — Stake MOR for Morpheus API credits, step by step',
  description = 'Monkey-proof guide to staking MOR tokens on Base for daily Morpheus API credits. 5 steps, ~15 minutes, no credit card.',
} = Astro.props;

const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content="/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <title>{title}</title>
    {plausibleDomain && (
      <script
        is:inline
        defer
        data-domain={plausibleDomain}
        src="https://plausible.io/js/script.js"
      />
    )}
  </head>
  <body>
    <slot />
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Add a placeholder index page using the layout**

Edit `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base>
  <main class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold">stakemor</h1>
    <p class="text-[var(--color-text-muted)] mt-4">Layout smoke test.</p>
  </main>
</Base>
```

- [ ] **Step 4: Verify dev server renders the layout**

Run: `cd stakemor && npm run dev`
Open `http://localhost:4321`.
Expected: dark page, green link styles, Inter font, footer at bottom. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add stakemor/src/layouts stakemor/src/components/Footer.astro stakemor/src/pages/index.astro
git commit -m "feat: add Base layout with meta, fonts, Plausible, footer"
```

---

## Task 6: Hero Component

**Files:**
- Create: `stakemor/src/components/Hero.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
---
<section class="px-6 pt-24 pb-12 max-w-4xl mx-auto text-center">
  <p class="uppercase tracking-widest text-xs text-[var(--color-mor)] font-medium mb-4">
    Morpheus API access · without a credit card
  </p>
  <h1 class="text-4xl md:text-6xl font-bold leading-tight">
    Stake MOR. Get Morpheus API credits.<br />
    <span class="text-[var(--color-mor)]">Step by step.</span>
  </h1>
  <p class="mt-6 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
    A monkey-proof walkthrough. ~15 minutes. You keep custody the whole time —
    we just point at the right buttons in the right order.
  </p>
  <div class="mt-8 flex items-center justify-center gap-3 text-sm text-[var(--color-text-dim)]">
    <span class="px-3 py-1 rounded-full border border-[var(--color-border)]">5 steps</span>
    <span class="px-3 py-1 rounded-full border border-[var(--color-border)]">~$2 in gas</span>
    <span class="px-3 py-1 rounded-full border border-[var(--color-border)]">7-day lock</span>
  </div>
</section>
```

- [ ] **Step 2: Render the hero in `index.astro`**

Replace the body of `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
---
<Base>
  <main>
    <Hero />
  </main>
</Base>
```

- [ ] **Step 3: Visual check**

Run: `cd stakemor && npm run dev` and visit `http://localhost:4321`.
Expected: centered hero with green eyebrow, big bold headline (green second line), subhead, three pill chips. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add stakemor/src/components/Hero.astro stakemor/src/pages/index.astro
git commit -m "feat: add hero section"
```

---

## Task 7: Amount Picker (Sticky, URL-Hash-Persisted)

**Files:**
- Create: `stakemor/src/components/AmountPicker.astro`

- [ ] **Step 1: Write `src/components/AmountPicker.astro`**

```astro
---
---
<aside
  id="amount-picker"
  class="sticky top-0 z-30 backdrop-blur bg-[var(--color-bg-translucent)] border-b border-[var(--color-border)]"
>
  <div class="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <p class="text-sm text-[var(--color-text-muted)] font-medium">
      How much MOR are you planning to stake?
    </p>
    <div class="inline-flex rounded-full border border-[var(--color-border)] p-1 self-start md:self-auto" role="tablist">
      <button
        type="button"
        role="tab"
        data-path="long"
        aria-selected="true"
        class="path-btn px-4 py-1.5 text-sm rounded-full transition-colors"
      >
        Any amount (recommended)
      </button>
      <button
        type="button"
        role="tab"
        data-path="short"
        aria-selected="false"
        class="path-btn px-4 py-1.5 text-sm rounded-full transition-colors"
      >
        Small (&lt; $500)
      </button>
    </div>
  </div>
</aside>

<style>
  .path-btn[aria-selected="true"] {
    background: var(--color-mor);
    color: #000;
    font-weight: 600;
  }
  .path-btn[aria-selected="false"] {
    color: var(--color-text-muted);
  }
  .path-btn[aria-selected="false"]:hover {
    color: var(--color-text);
  }
</style>

<script>
  type PathId = 'long' | 'short';

  function readHash(): PathId {
    const m = window.location.hash.match(/path=(long|short)/);
    return (m?.[1] as PathId) ?? 'long';
  }

  function applyPath(path: PathId) {
    document.querySelectorAll<HTMLButtonElement>('.path-btn').forEach((btn) => {
      btn.setAttribute(
        'aria-selected',
        btn.dataset.path === path ? 'true' : 'false',
      );
    });
    document.querySelectorAll<HTMLElement>('[data-path-section]').forEach((el) => {
      el.hidden = el.dataset.pathSection !== path;
    });
    window.dispatchEvent(
      new CustomEvent('pathchange', { detail: { path } }),
    );
  }

  function setPath(path: PathId) {
    const hash = `#path=${path}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
    applyPath(path);
  }

  document.querySelectorAll<HTMLButtonElement>('.path-btn').forEach((btn) => {
    btn.addEventListener('click', () => setPath(btn.dataset.path as PathId));
  });

  window.addEventListener('hashchange', () => applyPath(readHash()));
  applyPath(readHash());
</script>
```

- [ ] **Step 2: Render the picker in `index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import AmountPicker from '../components/AmountPicker.astro';
---
<Base>
  <Hero />
  <AmountPicker />
  <main class="max-w-4xl mx-auto px-6 py-12">
    <section data-path-section="long">
      <p class="text-[var(--color-text-muted)]">Long-path content goes here.</p>
    </section>
    <section data-path-section="short" hidden>
      <p class="text-[var(--color-text-muted)]">Short-path content goes here.</p>
    </section>
  </main>
</Base>
```

- [ ] **Step 3: Manual test the picker**

Run: `cd stakemor && npm run dev`
Verify in `http://localhost:4321`:
- Picker bar sticks to the top while scrolling.
- Clicking "Small" swaps the visible section and updates the URL to `#path=short`.
- Hard-loading `http://localhost:4321/#path=short` shows the short section selected.
- Browser back/forward swaps the sections.
Stop the server.

- [ ] **Step 4: Commit**

```bash
git add stakemor/src/components/AmountPicker.astro stakemor/src/pages/index.astro
git commit -m "feat: sticky amount picker with URL-hash persistence and pathchange event"
```

---

## Task 8: Path Sidebar (Sticky, Scroll Spy)

**Files:**
- Create: `stakemor/src/components/PathSidebar.astro`

- [ ] **Step 1: Write `src/components/PathSidebar.astro`**

```astro
---
import { longPath } from '../data/long-path';
import { shortPath } from '../data/short-path';
---
<nav
  id="path-sidebar"
  aria-label="Step navigation"
  class="hidden lg:block sticky top-24 self-start w-56 shrink-0"
>
  <p class="text-xs uppercase tracking-widest text-[var(--color-text-dim)] mb-3">
    Steps
  </p>

  <ol data-sidebar-list="long" class="space-y-1">
    {longPath.steps.map((step) => (
      <li>
        <a
          href={`#step-long-${step.number}`}
          data-spy={`step-long-${step.number}`}
          class="spy-link block py-1.5 pl-3 border-l-2 border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {step.number}. {step.title.split(/[—–-]/)[0].trim()}
        </a>
      </li>
    ))}
  </ol>

  <ol data-sidebar-list="short" class="space-y-1" hidden>
    {shortPath.steps.map((step) => (
      <li>
        <a
          href={`#step-short-${step.number}`}
          data-spy={`step-short-${step.number}`}
          class="spy-link block py-1.5 pl-3 border-l-2 border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {step.number}. {step.title.split(/[—–-]/)[0].trim()}
        </a>
      </li>
    ))}
  </ol>
</nav>

<style>
  .spy-link[data-active="true"] {
    color: var(--color-mor);
    border-left-color: var(--color-mor);
    font-weight: 500;
  }
</style>

<script>
  function activate(id: string | null) {
    document.querySelectorAll<HTMLAnchorElement>('.spy-link').forEach((a) => {
      a.setAttribute('data-active', a.dataset.spy === id ? 'true' : 'false');
    });
  }

  function setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) activate(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );
    document.querySelectorAll<HTMLElement>('[id^="step-"]').forEach((el) => {
      observer.observe(el);
    });
  }

  function showSidebarFor(path: string) {
    document.querySelectorAll<HTMLElement>('[data-sidebar-list]').forEach((el) => {
      el.hidden = el.dataset.sidebarList !== path;
    });
  }

  window.addEventListener('pathchange', (e) => {
    const detail = (e as CustomEvent<{ path: string }>).detail;
    showSidebarFor(detail.path);
  });

  setupObserver();
  const initialHash = window.location.hash.match(/path=(long|short)/);
  showSidebarFor(initialHash?.[1] ?? 'long');
</script>
```

- [ ] **Step 2: Restructure `index.astro` for the sidebar layout**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import AmountPicker from '../components/AmountPicker.astro';
import PathSidebar from '../components/PathSidebar.astro';
---
<Base>
  <Hero />
  <AmountPicker />
  <div class="max-w-6xl mx-auto px-6 py-12 flex gap-12">
    <PathSidebar />
    <main class="flex-1 min-w-0 space-y-12">
      <section data-path-section="long" class="space-y-12">
        {[1, 2, 3, 4, 5].map((n) => (
          <div id={`step-long-${n}`} class="min-h-[60vh] border border-[var(--color-border)] rounded-lg p-6">
            <p class="text-[var(--color-text-muted)]">Long step {n} placeholder</p>
          </div>
        ))}
      </section>
      <section data-path-section="short" class="space-y-12" hidden>
        {[1, 2, 3, 4].map((n) => (
          <div id={`step-short-${n}`} class="min-h-[60vh] border border-[var(--color-border)] rounded-lg p-6">
            <p class="text-[var(--color-text-muted)]">Short step {n} placeholder</p>
          </div>
        ))}
      </section>
    </main>
  </div>
</Base>
```

- [ ] **Step 3: Manual test the sidebar**

Run: `cd stakemor && npm run dev`
Verify at `http://localhost:4321`:
- Sidebar appears on screens ≥1024px wide, sticky as you scroll.
- The active step in the sidebar highlights green as you scroll past each placeholder.
- Switching paths via the picker swaps the sidebar list (long: 5 entries, short: 4 entries).
- Sidebar links jump to the matching step section.
Stop the server.

- [ ] **Step 4: Commit**

```bash
git add stakemor/src/components/PathSidebar.astro stakemor/src/pages/index.astro
git commit -m "feat: sticky path sidebar with scroll-spy active state"
```

---

## Task 9: StepCard + PathSection

**Files:**
- Create: `stakemor/src/components/StepCard.astro`
- Create: `stakemor/src/components/PathSection.astro`

- [ ] **Step 1: Write `src/components/StepCard.astro`**

```astro
---
import type { Step } from '../data/types';

interface Props {
  step: Step;
  pathId: 'long' | 'short';
}

const { step, pathId } = Astro.props;
---
<article
  id={`step-${pathId}-${step.number}`}
  class="relative scroll-mt-28 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8"
>
  <div class="flex items-start gap-5">
    <div class="shrink-0 w-12 h-12 rounded-full bg-[var(--color-mor-dim)] text-[var(--color-mor)] font-bold grid place-items-center text-lg">
      {step.number}
    </div>
    <div class="flex-1 min-w-0">
      <h2 class="text-2xl font-semibold leading-snug">{step.title}</h2>
      <p class="mt-3 text-[var(--color-text-muted)] leading-relaxed">
        {step.blurb}
      </p>

      <a
        href={step.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        data-cta={`${pathId}-${step.number}`}
        class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-[var(--color-mor)] text-black font-semibold hover:bg-[var(--color-mor-hover)] transition-colors"
      >
        {step.ctaLabel}
        <span aria-hidden="true">→</span>
      </a>

      {step.screenshot && (
        <img
          src={step.screenshot}
          alt={`Screenshot of ${step.ctaLabel}`}
          class="mt-6 rounded-lg border border-[var(--color-border)]"
          loading="lazy"
        />
      )}

      <div class="mt-6 grid gap-3 text-sm">
        <div class="flex gap-2">
          <span class="text-[var(--color-mor)]">✓</span>
          <p class="text-[var(--color-text-muted)]">
            <strong class="text-[var(--color-text)]">What success looks like:</strong>{' '}
            {step.successCriterion}
          </p>
        </div>
        {step.gotcha && (
          <div class="flex gap-2 p-3 rounded-lg bg-[var(--color-warn-bg)] border border-[var(--color-warn-border)]">
            <span class="text-[var(--color-warn)]">⚠</span>
            <p class="text-[var(--color-text-muted)]">
              <strong class="text-[var(--color-warn-text)]">Gotcha:</strong> {step.gotcha}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</article>

<script>
  document.querySelectorAll<HTMLAnchorElement>('a[data-cta]').forEach((a) => {
    a.addEventListener('click', () => {
      const w = window as unknown as {
        plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
      };
      w.plausible?.('cta_click', { props: { step: a.dataset.cta ?? '' } });
    });
  });
</script>
```

- [ ] **Step 2: Write `src/components/PathSection.astro`**

```astro
---
import type { Path } from '../data/types';
import StepCard from './StepCard.astro';

interface Props {
  path: Path;
  hidden?: boolean;
}

const { path, hidden = false } = Astro.props;
---
<section
  data-path-section={path.id}
  hidden={hidden}
  class="space-y-8"
>
  <header class="space-y-2">
    <p class="text-xs uppercase tracking-widest text-[var(--color-mor)] font-medium">
      {path.label}
    </p>
    <p class="text-[var(--color-text-muted)] text-sm">{path.amountHint}</p>
  </header>
  {path.steps.map((step) => (
    <StepCard step={step} pathId={path.id} />
  ))}
</section>
```

- [ ] **Step 3: Replace placeholder steps in `index.astro` with real ones**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import AmountPicker from '../components/AmountPicker.astro';
import PathSidebar from '../components/PathSidebar.astro';
import PathSection from '../components/PathSection.astro';
import { longPath } from '../data/long-path';
import { shortPath } from '../data/short-path';
---
<Base>
  <Hero />
  <AmountPicker />
  <div class="max-w-6xl mx-auto px-6 py-12 flex gap-12">
    <PathSidebar />
    <main class="flex-1 min-w-0">
      <PathSection path={longPath} />
      <PathSection path={shortPath} hidden />
    </main>
  </div>
</Base>
```

- [ ] **Step 4: Visual + functional check**

Run: `cd stakemor && npm run dev`
Verify at `http://localhost:4321`:
- Long path renders 5 cards, short path renders 4 (after switching the picker).
- Each card shows the green numeric badge, title, blurb, green CTA button, success line, and (where defined) the gotcha callout.
- Clicking a CTA opens the right URL in a new tab. For Sushi links, confirm `referrer=stakemor` is in the URL.
- **Critical:** click each Sushi CTA and confirm the destination loads with the correct from-chain, to-chain, and token pre-selected. If Sushi ignores any of our query params (`chainId`, `toChainId`, `token0`, `token1`, `referrer`), update `src/lib/urls.ts` to match what Sushi actually expects, and adjust `tests/lib/urls.test.ts` to match. Re-run tests after the change.
- Sidebar scroll-spy still highlights as you scroll through the cards.
Stop the server.

- [ ] **Step 5: Commit**

```bash
git add stakemor/src/components/StepCard.astro stakemor/src/components/PathSection.astro stakemor/src/pages/index.astro
git commit -m "feat: render full step cards from path data"
```

---

## Task 10: Subscribe API Endpoint (TDD)

**Files:**
- Create: `stakemor/tests/lib/subscribe.test.ts`
- Create: `stakemor/src/lib/subscribe.ts`
- Create: `stakemor/tests/api/subscribe.endpoint.test.ts`
- Create: `stakemor/src/pages/api/subscribe.ts`

- [ ] **Step 1: Write the failing tests for the subscribe lib**

Create `stakemor/tests/lib/subscribe.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribe } from '../../src/lib/subscribe';

const mockCreate = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: { create: mockCreate },
  })),
}));

beforeEach(() => {
  mockCreate.mockReset();
});

describe('subscribe', () => {
  it('creates a contact in the configured Resend audience', async () => {
    mockCreate.mockResolvedValue({ data: { id: 'c_1' }, error: null });

    const result = await subscribe({
      email: 'a@b.com',
      path: 'long',
      apiKey: 'key',
      audienceId: 'aud',
    });

    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({
      email: 'a@b.com',
      audienceId: 'aud',
      unsubscribed: false,
      firstName: undefined,
      lastName: undefined,
    });
  });

  it('rejects an invalid email', async () => {
    const result = await subscribe({
      email: 'not-an-email',
      path: 'long',
      apiKey: 'key',
      audienceId: 'aud',
    });
    expect(result).toEqual({ ok: false, error: 'invalid_email' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns an error when Resend fails', async () => {
    mockCreate.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const result = await subscribe({
      email: 'a@b.com',
      path: 'short',
      apiKey: 'key',
      audienceId: 'aud',
    });
    expect(result).toEqual({ ok: false, error: 'provider_error' });
  });
});
```

- [ ] **Step 2: Run — verify failure**

Run: `cd stakemor && npm test -- subscribe`
Expected: FAIL with "cannot find module".

- [ ] **Step 3: Write `src/lib/subscribe.ts`**

```typescript
import { Resend } from 'resend';

export interface SubscribeInput {
  email: string;
  path: 'long' | 'short';
  apiKey: string;
  audienceId: string;
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' | 'provider_error' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: 'invalid_email' };
  }
  const resend = new Resend(input.apiKey);
  const { error } = await resend.contacts.create({
    email: input.email,
    audienceId: input.audienceId,
    unsubscribed: false,
    firstName: undefined,
    lastName: undefined,
  });
  if (error) {
    return { ok: false, error: 'provider_error' };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run — verify the lib tests pass**

Run: `cd stakemor && npm test -- subscribe.test`
Expected: PASS, 3 tests green.

- [ ] **Step 5: Write the failing endpoint test**

Create `stakemor/tests/api/subscribe.endpoint.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const subscribeMock = vi.fn();
vi.mock('../../src/lib/subscribe', () => ({ subscribe: subscribeMock }));

import { POST } from '../../src/pages/api/subscribe';

beforeEach(() => {
  subscribeMock.mockReset();
});

function makeContext(body: unknown, env: Record<string, string> = {}) {
  return {
    request: new Request('http://x/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    locals: {
      runtime: {
        env: {
          RESEND_API_KEY: 'key',
          RESEND_AUDIENCE_ID: 'aud',
          ...env,
        },
      },
    },
  } as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/subscribe', () => {
  it('returns 200 + ok:true when subscribe succeeds', async () => {
    subscribeMock.mockResolvedValue({ ok: true });
    const res = await POST(makeContext({ email: 'a@b.com', path: 'long' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(subscribeMock).toHaveBeenCalledWith({
      email: 'a@b.com',
      path: 'long',
      apiKey: 'key',
      audienceId: 'aud',
    });
  });

  it('returns 400 on invalid email', async () => {
    subscribeMock.mockResolvedValue({ ok: false, error: 'invalid_email' });
    const res = await POST(makeContext({ email: 'bad', path: 'short' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: 'invalid_email',
    });
  });

  it('returns 502 on provider error', async () => {
    subscribeMock.mockResolvedValue({ ok: false, error: 'provider_error' });
    const res = await POST(makeContext({ email: 'a@b.com', path: 'long' }));
    expect(res.status).toBe(502);
  });

  it('returns 400 when path is missing or invalid', async () => {
    const res = await POST(makeContext({ email: 'a@b.com', path: 'huge' }));
    expect(res.status).toBe(400);
    expect(subscribeMock).not.toHaveBeenCalled();
  });

  it('returns 500 when env is missing the API key', async () => {
    const res = await POST(
      makeContext({ email: 'a@b.com', path: 'long' }, { RESEND_API_KEY: '' }),
    );
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 6: Write `src/pages/api/subscribe.ts`**

```typescript
import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/subscribe';

export const prerender = false;

interface Env {
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
}

function envFrom(locals: App.Locals): Env {
  const runtime = (locals as unknown as { runtime?: { env?: Env } }).runtime;
  return runtime?.env ?? (process.env as unknown as Env);
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const { email, path } = (body ?? {}) as {
    email?: string;
    path?: string;
  };
  if (typeof email !== 'string' || (path !== 'long' && path !== 'short')) {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const env = envFrom(locals);
  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return Response.json(
      { ok: false, error: 'misconfigured' },
      { status: 500 },
    );
  }

  const result = await subscribe({
    email,
    path,
    apiKey: env.RESEND_API_KEY,
    audienceId: env.RESEND_AUDIENCE_ID,
  });

  if (result.ok) return Response.json(result, { status: 200 });
  if (result.error === 'invalid_email')
    return Response.json(result, { status: 400 });
  return Response.json(result, { status: 502 });
};
```

- [ ] **Step 7: Run — verify all subscribe tests pass**

Run: `cd stakemor && npm test`
Expected: PASS for all four test files (urls, paths, subscribe, subscribe.endpoint).

- [ ] **Step 8: Commit**

```bash
git add stakemor/src/lib/subscribe.ts stakemor/src/pages/api/subscribe.ts stakemor/tests/lib/subscribe.test.ts stakemor/tests/api/subscribe.endpoint.test.ts
git commit -m "feat: add Resend-backed subscribe endpoint with TDD coverage"
```

---

## Task 11: Email Capture Component

**Files:**
- Create: `stakemor/src/components/EmailCapture.astro`

- [ ] **Step 1: Write `src/components/EmailCapture.astro`**

```astro
---
---
<section
  id="email-capture"
  class="max-w-2xl mx-auto px-6 mt-24 mb-12 text-center"
>
  <h2 class="text-3xl font-semibold">
    Want <span class="text-[var(--color-mor)]">one-click stakemor</span> when it launches?
  </h2>
  <p class="mt-3 text-[var(--color-text-muted)]">
    We are building a tool that does swap + bridge + stake in a single
    transaction. Drop your email and you will be the first to know.
  </p>
  <form id="subscribe-form" class="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
    <input
      type="email"
      name="email"
      required
      placeholder="you@example.com"
      class="flex-1 px-4 py-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-mor)]"
    />
    <button
      type="submit"
      class="px-5 py-3 rounded-lg bg-[var(--color-mor)] text-black font-semibold hover:bg-[var(--color-mor-hover)] transition-colors disabled:opacity-50"
    >
      Notify me
    </button>
  </form>
  <p
    id="subscribe-status"
    aria-live="polite"
    class="mt-4 text-sm min-h-[1.25rem]"
  ></p>
</section>

<script>
  function currentPath(): 'long' | 'short' {
    const m = window.location.hash.match(/path=(long|short)/);
    return (m?.[1] as 'long' | 'short') ?? 'long';
  }

  const form = document.getElementById('subscribe-form') as HTMLFormElement | null;
  const status = document.getElementById('subscribe-status');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      button.disabled = true;
      status.textContent = 'Subscribing…';
      status.style.color = 'var(--color-text-muted)';
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, path: currentPath() }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (json.ok) {
          status.textContent = "You're in. We'll email you at launch.";
          status.style.color = 'var(--color-mor)';
          form.reset();
          const w = window as unknown as {
            plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
          };
          w.plausible?.('subscribe', { props: { path: currentPath() } });
        } else {
          status.textContent =
            json.error === 'invalid_email'
              ? 'That email looks off — try again.'
              : 'Something broke on our end. Try again in a minute.';
          status.style.color = 'var(--color-error)';
        }
      } catch {
        status.textContent = 'Network error. Try again.';
        status.style.color = '#fb7185';
      } finally {
        button.disabled = false;
      }
    });
  }
</script>
```

- [ ] **Step 2: Render in `index.astro`**

Update `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import AmountPicker from '../components/AmountPicker.astro';
import PathSidebar from '../components/PathSidebar.astro';
import PathSection from '../components/PathSection.astro';
import EmailCapture from '../components/EmailCapture.astro';
import { longPath } from '../data/long-path';
import { shortPath } from '../data/short-path';
---
<Base>
  <Hero />
  <AmountPicker />
  <div class="max-w-6xl mx-auto px-6 py-12 flex gap-12">
    <PathSidebar />
    <main class="flex-1 min-w-0">
      <PathSection path={longPath} />
      <PathSection path={shortPath} hidden />
    </main>
  </div>
  <EmailCapture />
</Base>
```

- [ ] **Step 3: Manual test (without real Resend keys)**

Run: `cd stakemor && cp .env.example .env && npm run dev`
Visit `http://localhost:4321`, scroll to email capture.
Submit `bad-email` → expect "That email looks off — try again."
Submit `you@example.com` → expect "Something broke on our end" (because the env values are placeholders — that proves the endpoint is wired and validates input correctly).
Stop the server.

- [ ] **Step 4: Commit**

```bash
git add stakemor/src/components/EmailCapture.astro stakemor/src/pages/index.astro
git commit -m "feat: add email capture form posting to /api/subscribe"
```

---

## Task 12: FAQ Component + Glossary

**Files:**
- Create: `stakemor/src/data/faq.ts`
- Create: `stakemor/src/components/FAQ.astro`

- [ ] **Step 1: Write `src/data/faq.ts`**

```typescript
export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: 'Why is the mor.org dashboard so confusing?',
    a: "It's an early-stage UX. The biggest trap: the sidebar item called \"Builders\" is actually the list of staking subnets. You click \"Builders\" even though you are staking, not building.",
  },
  {
    q: 'What is a "subnet" and why do I stake to one?',
    a: "Each subnet is a pool that earns its own daily MOR emissions. The \"Morpheus Marketplace API\" subnet is the official one that grants daily API credits at app.mor.org. Staking elsewhere does not get you API access.",
  },
  {
    q: 'Why do I need ETH on Base if I am bridging MOR there?',
    a: 'The bridge moves MOR, not ETH. To stake on Base you need a tiny amount of Base ETH (~$0.50) to pay the gas for the staking transaction. This trips up most first-timers.',
  },
  {
    q: 'How long is my MOR locked?',
    a: '7 days minimum from your most recent stake. You can add more anytime, but each addition resets the lock window for the new amount.',
  },
  {
    q: 'When do daily API credits start?',
    a: 'Credits refresh at midnight UTC. After staking and linking your wallet, you may not see credits until the next refresh.',
  },
  {
    q: 'Why SushiSwap and not Uniswap?',
    a: 'Sushi has a real cross-chain swap (ETH-mainnet → MOR-Arbitrum in one transaction) and an open referral program. Uniswap requires you to bridge first, then swap separately, and has no public referral. We also earn a small kickback through the Sushi referral on swaps you make from this guide — that funds the work.',
  },
  {
    q: 'Are you affiliated with Morpheus?',
    a: "No. This is an independent guide built because the existing flow is hard to follow. We don't have insider access and don't speak for the project.",
  },
];
```

- [ ] **Step 2: Write `src/components/FAQ.astro`**

```astro
---
import { faq } from '../data/faq';
---
<section id="faq" class="max-w-3xl mx-auto px-6 py-16">
  <h2 class="text-3xl font-semibold mb-8">FAQ</h2>
  <div class="space-y-3">
    {faq.map((item) => (
      <details class="group bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg">
        <summary class="cursor-pointer list-none p-5 flex items-center justify-between font-medium">
          <span>{item.q}</span>
          <span class="text-[var(--color-mor)] transition-transform group-open:rotate-45">+</span>
        </summary>
        <p class="px-5 pb-5 text-[var(--color-text-muted)] leading-relaxed">
          {item.a}
        </p>
      </details>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Render in `index.astro`**

Add `import FAQ from '../components/FAQ.astro';` and render `<FAQ />` after `<EmailCapture />`.

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import AmountPicker from '../components/AmountPicker.astro';
import PathSidebar from '../components/PathSidebar.astro';
import PathSection from '../components/PathSection.astro';
import EmailCapture from '../components/EmailCapture.astro';
import FAQ from '../components/FAQ.astro';
import { longPath } from '../data/long-path';
import { shortPath } from '../data/short-path';
---
<Base>
  <Hero />
  <AmountPicker />
  <div class="max-w-6xl mx-auto px-6 py-12 flex gap-12">
    <PathSidebar />
    <main class="flex-1 min-w-0">
      <PathSection path={longPath} />
      <PathSection path={shortPath} hidden />
    </main>
  </div>
  <EmailCapture />
  <FAQ />
</Base>
```

- [ ] **Step 4: Visual check**

Run: `cd stakemor && npm run dev`
Verify FAQ renders, items expand on click, "+" rotates to "×" on open.
Stop the server.

- [ ] **Step 5: Commit**

```bash
git add stakemor/src/data/faq.ts stakemor/src/components/FAQ.astro stakemor/src/pages/index.astro
git commit -m "feat: add FAQ section addressing common confusion points"
```

---

## Task 13: README + Deployment Notes

**Files:**
- Create: `stakemor/README.md`

- [ ] **Step 1: Write `stakemor/README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add stakemor/README.md
git commit -m "docs: add README with stack, local dev, env, deployment notes"
```

---

## Task 14: Build & Smoke Test the Full Site

- [ ] **Step 1: Run the full test suite**

Run: `cd stakemor && npm test`
Expected: all tests pass across `lib`, `data`, `api`.

- [ ] **Step 2: Type check**

Run: `cd stakemor && npm run typecheck`
Expected: no type errors.

- [ ] **Step 3: Production build**

Run: `cd stakemor && npm run build`
Expected: build succeeds, `dist/` populated.

- [ ] **Step 4: Manual end-to-end click-through**

Run: `cd stakemor && npm run preview`
Open `http://localhost:4321` and verify:
- Hero, picker, sidebar, both paths, email form, FAQ all render.
- Switching paths via picker swaps sidebar + step cards.
- Every CTA opens its destination in a new tab.
- Every Sushi link contains `referrer=stakemor`.
- FAQ details open/close.
- Resize window: sidebar hidden below 1024px, picker stays sticky on mobile.
Stop the preview server.

- [ ] **Step 5: Commit any fixes; otherwise no commit**

If issues surfaced and required fixes, commit them. Otherwise skip.

---

## Known Scope Reductions vs Spec

- **Sidebar email-capture variant:** the spec calls for a smaller email form in the sticky sidebar in addition to the bottom-of-page form. Deferred until we see whether the bottom-of-page form converts. Adding it later is one component + a render call in `PathSidebar.astro`.

## Post-Launch Follow-Ups (Not Tasks — Checklist for User)

- Run through both paths end-to-end with a real wallet and capture screenshots. Drop them into `public/screenshots/` and add `screenshot:` paths to the step data.
- Apply for a real SushiSwap referrer code (the default `stakemor` is a placeholder until the program is set up) and update the env var in production.
- Create the Resend audience and copy its ID into Cloudflare env.
- Set up Plausible for `stakemor.com` and add the domain to env.
- Design a real OG image (`public/og-image.png`).
- Consider adding the secondary email capture in the sidebar (mentioned in spec but deferred — wait to see if the bottom-of-page form converts first).
