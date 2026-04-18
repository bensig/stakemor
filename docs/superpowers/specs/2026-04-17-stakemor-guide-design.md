# stakemor.com — MOR Staking Guide (Phase 1)

**Date:** 2026-04-17
**Status:** Draft for user review
**Domain:** stakemor.com (owned)
**Phase:** 1 of 2 — content guide. Phase 2 (one-click swap+bridge+stake product) is deferred.

## Goal

A single-page, monkey-proof walkthrough that takes a user with ETH already in their wallet from "I want API access to Morpheus models" to "I'm staked on the Morpheus Marketplace API subnet and my wallet is linked at app.mor.org."

The guide also acts as a lead magnet: capture email addresses for the Phase 2 product launch ("one-click stakemor"), and earn SushiSwap referral fees on every swap a reader executes.

## Non-goals

- Onboarding total newbies (no wallet, no crypto). Audience already has a wallet and ETH.
- Custodial flows or smart-contract automation. Phase 1 is content + outbound links; the user does every transaction in their own wallet.
- Multi-network coverage beyond Base for staking. Base is the recommended network; we do not document Arbitrum-as-stake-target.
- Phase 2 product (swap+bridge+stake aggregator). Spec'd separately when Phase 1 ships.

## Audience

A user who:
- Has a self-custody wallet (Rabby, MetaMask, Trust, Coinbase Wallet — Rabby recommended).
- Has ETH on at least one EVM chain (Ethereum mainnet most common).
- Wants Morpheus API credits without paying with a credit card.
- Has roughly enough crypto literacy to do a Uniswap swap, but probably has never bridged or staked.

Crypto literacy: medium. They know what a swap is. They likely don't know what a Builders Subnet is, and they will be confused that "Builders" actually means "Staking Subnets" on dashboard.mor.org. The guide must call this out plainly.

## Page Structure

Decision-first + path-specific long scroll (option C from brainstorming).

```
┌────────────────────────────────────────────────────────┐
│  HERO                                                   │
│  "Stake MOR. Get Morpheus API credits. Step by step."   │
│  Subhead: "5 steps. ~15 minutes. No credit card."       │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  AMOUNT PICKER (sticky on scroll)                       │
│  How much are you planning to stake?                    │
│  [ Small (< $500) ] [ Serious ($500+) ]                 │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  PATH (changes based on picker)                         │
│  Step 1 ─ Step 2 ─ Step 3 ─ Step 4 ─ Step 5             │
│  (sticky sidebar tracks scroll position)                │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  EMAIL CAPTURE                                          │
│  "Want one-click stakemor when it launches? Drop email."│
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  FAQ + Glossary ("Builders means Subnets," etc.)        │
└────────────────────────────────────────────────────────┘
```

The amount picker stores the choice in URL hash (`#path=long` / `#path=short`) so links can deep-link to a specific path. Default load: long path (safer for everyone, only marginally more steps for small amounts).

## The Two Paths

### Long Path (recommended, works for any amount)

| Step | What | Where | Notes |
|------|------|-------|-------|
| 1 | Swap ETH → MOR (cross-chain) | sushi.com/swap with referrer param. ETH on Ethereum mainnet → MOR on Arbitrum. | One transaction. Sushi xSwap handles the bridge. |
| 2 | Bridge MOR Arbitrum → Base | dashboard.mor.org/bridge-mor | User pays gas on Arbitrum. |
| 3 | Get tiny ETH on Base for gas | superbridge.app/base — bridge ~$2 of ETH from mainnet to Base | Foot-gun: stake tx needs Base ETH. Most users won't have any. Call this out hard. |
| 4 | Stake on the Morpheus Marketplace API subnet | dashboard.mor.org/builders → search "Morpheus Marketplace API" → Stake | 7-day lock. Min deposit 0.001 MOR. |
| 5 | Link wallet to app.mor.org account | app.mor.org/billing → Staking Status → Connect Another Wallet | Daily API credits start refreshing at midnight UTC. |

### Short Path (only for small stakes, < ~$500)

| Step | What | Where | Notes |
|------|------|-------|-------|
| 1 | Bridge ETH to Base | superbridge.app/base | Need ETH on Base for both swap gas and stake gas. |
| 2 | Swap ETH → MOR on Base | sushi.com/swap with referrer param. ETH Base → MOR Base. | Base MOR liquidity is thin — slippage gets ugly past ~1 ETH. |
| 3 | Stake on the Morpheus Marketplace API subnet | dashboard.mor.org/builders → "Morpheus Marketplace API" → Stake | Same as long-path step 4. |
| 4 | Link wallet to app.mor.org | app.mor.org/billing | Same as long-path step 5. |

Both paths terminate at the same final state: staked + wallet linked + daily API credits accruing.

### Each Step Renders As

- A numbered card with a clear one-line action title.
- A "what you're doing and why" paragraph (1–2 sentences, plain English).
- A primary CTA button: "Open [tool name]" — opens the right URL in a new tab, with referrer param baked in where applicable.
- A screenshot of the destination tool with the relevant button/field highlighted.
- A "what success looks like" line ("You'll see your MOR balance update on Arbitrum") and a "common gotchas" callout.

## Revenue Capture (Phase 1)

- **SushiSwap referral** on every swap link. Generate a single referrer code/link, append to all `sushi.com/swap` URLs in the guide. Earns 75% of the 40% Sushi referral pool (so ~30% of swap fees on referred swaps).
- **Email list** as the lead-asset for Phase 2.
- **No tip jar** in Phase 1 — keep the page clean. Add later if email-capture conversion is weak.

## Email Capture

- Single email field at the bottom of the path section, plus a smaller variant in the sticky sidebar for users who scroll past without staking.
- Copy: "Want one-click stakemor when it launches? We're building a tool that does swap + bridge + stake in a single transaction. Drop your email."
- Backend: simplest possible — Resend/Plunk/ConvertKit form. No DB of our own.
- Track which path was selected when they signed up (segment future emails by interest).

## Visual Style

Match mor.org's aesthetic so the guide feels native and trustworthy:
- Dark background (#0a0a0a-ish), green accent (#22c55e-ish, Morpheus green).
- Mor.org's wing/feather logo allowed if licensing permits; otherwise use a similar minimal mark + "stakemor" wordmark.
- Same font family if identifiable (looks like Inter or similar geometric sans).
- Small footer disclaimer: "Independent guide, not affiliated with Morpheus AI."

## The Builders/Subnets Terminology Trap

The mor.org dashboard uses "Builders" as the menu label for what are actually staking subnets. Multiple users have hit this. The guide must:
- In Step 4, say plainly: "Click **Builders** in the dashboard sidebar. Yes, even though you're a staker, not a builder. The page that opens is actually a list of subnets you can stake into."
- Include this in the FAQ under "Why is the dashboard so confusing?"

## Tech Stack

- **Static site.** No backend except the email-capture endpoint.
- **Framework:** Astro or plain Next.js (static export). Astro recommended — better for content-heavy single pages, smaller JS payload.
- **Hosting:** Vercel or Cloudflare Pages.
- **Email:** Resend (simplest API, generous free tier) or ConvertKit (better if planning a newsletter).
- **Analytics:** Plausible or Umami (privacy-friendly, no GDPR banner).

## Success Metrics

- **Primary:** number of users who reach the "wallet linked, credits accruing" end state. (Inferred from the post-stake event in app.mor.org.)
- **Secondary:** SushiSwap referral fee earnings per month.
- **Tertiary:** email signups, time-on-page, scroll depth.

We can't directly measure the primary metric without instrumenting outbound clicks; track CTA click-throughs as a proxy for funnel drop-off.

## Open Questions for Phase 2 (Not Spec'd Here)

- Smart-contract architecture: do we own a router contract on Base, or just orchestrate Sushi + bridge + stake calls from a frontend with the user's wallet?
- Fee model: flat USD fee, percentage of stake amount, or just keep the Sushi referral?
- Custody / approval pattern: do we batch with EIP-5792, or step the user through 3 prompts?

## Out of Scope (Phase 1)

- Anything that requires the user to trust us with funds.
- Multi-language support.
- A "withdraw and unstake" guide (revisit when there's demand; lock period is 7 days so it's not urgent).
- A guide for builders (actual builders) wanting to register a subnet.

## Implementation Order (for the plan that follows)

1. Set up Astro project + design tokens matching mor.org.
2. Hero + amount picker + sticky sidebar shell.
3. Long-path step cards (with placeholder screenshots).
4. Short-path step cards.
5. Email capture form + Resend integration.
6. FAQ + glossary.
7. Real screenshots taken from a fresh staking run (proof the steps still work).
8. Sushi referral param wiring.
9. Plausible analytics.
10. Deploy to Vercel/Cloudflare on stakemor.com.
