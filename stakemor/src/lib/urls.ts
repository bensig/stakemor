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
