const CHAIN_SLUGS: Record<number, string> = {
  1: 'ethereum',
  42161: 'arbitrum',
  8453: 'base',
};

export interface SushiSwapParams {
  fromChain: number;
  toChain: number;
  fromToken: string; // 'NATIVE' or 0x... address (informational; Sushi UI may not auto-fill)
  toToken: string;
  referrer: string;  // wallet address that owns the Sushi referral code
}

function chainSlug(id: number): string {
  const slug = CHAIN_SLUGS[id];
  if (!slug) throw new Error(`sushiSwapUrl: unsupported chainId ${id}`);
  return slug;
}

export function sushiSwapUrl(p: SushiSwapParams): string {
  if (!p.referrer) {
    throw new Error('sushiSwapUrl: referrer is required');
  }
  const fromSlug = chainSlug(p.fromChain);
  const isCrossChain = p.fromChain !== p.toChain;
  const path = isCrossChain ? 'cross-chain-swap' : 'swap';
  const params = new URLSearchParams({ referrer: p.referrer });
  if (isCrossChain) {
    params.set('chainId1', String(p.toChain));
  }
  params.set('token0', p.fromToken);
  params.set('token1', p.toToken);
  return `https://www.sushi.com/${fromSlug}/${path}?${params.toString()}`;
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
