import { describe, it, expect } from 'vitest';
import {
  sushiSwapUrl,
  superbridgeUrl,
  morBridgeUrl,
  morBuildersUrl,
  morBillingUrl,
} from '../../src/lib/urls';

describe('sushiSwapUrl', () => {
  it('builds a cross-chain ETH-mainnet → MOR-Arbitrum URL with referrer + dstChainId', () => {
    const url = sushiSwapUrl({
      fromChain: 1,
      toChain: 42161,
      fromToken: 'NATIVE',
      toToken: '0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86',
      referrer: '0x4070b37b39347f34effE4607F2D7611d6C3C9fDF',
    });
    expect(url).toContain('https://www.sushi.com/ethereum/cross-chain-swap');
    expect(url).toContain('dstChainId=42161');
    expect(url).toContain('referrer=0x4070b37b39347f34effE4607F2D7611d6C3C9fDF');
    expect(url).toContain('token1=0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86');
    expect(url).not.toContain('token0='); // NATIVE is omitted
  });

  it('builds a same-chain Base swap URL', () => {
    const url = sushiSwapUrl({
      fromChain: 8453,
      toChain: 8453,
      fromToken: 'NATIVE',
      toToken: '0x7431ada8a591c955a994a21710752ef9b882b8e3',
      referrer: '0x4070b37b39347f34effE4607F2D7611d6C3C9fDF',
    });
    expect(url).toContain('https://www.sushi.com/base/swap');
    expect(url).not.toContain('cross-chain-swap');
    expect(url).not.toContain('dstChainId');
    expect(url).toContain('referrer=0x4070b37b39347f34effE4607F2D7611d6C3C9fDF');
    expect(url).toContain('token1=0x7431ada8a591c955a994a21710752ef9b882b8e3');
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

  it('throws on unsupported chain id', () => {
    expect(() =>
      sushiSwapUrl({
        fromChain: 999,
        toChain: 999,
        fromToken: 'NATIVE',
        toToken: '0xabc',
        referrer: '0xdef',
      }),
    ).toThrow(/unsupported chainId/);
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
