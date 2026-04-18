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
