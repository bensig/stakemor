import type { Path } from './types';
import {
  superbridgeUrl,
  sushiSwapUrl,
  morBuildersUrl,
  morBillingUrl,
} from '../lib/urls';

const REFERRER = import.meta.env.PUBLIC_SUSHI_REFERRER ?? '0x4070b37b39347f34effE4607F2D7611d6C3C9fDF';

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
        'Use SushiSwap on Base to swap your bridged ETH into MOR. If MOR is not pre-selected in the UI, paste the address below.',
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
      contractAddress: MOR_BASE,
      contractLabel: 'MOR on Base',
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
