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
