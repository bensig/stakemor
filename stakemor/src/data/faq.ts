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
    q: 'How much MOR do I need to stake to be useful?',
    a: 'As a rough rule of thumb, 4,800 MOR earns about $12 / day in API credits at current rates. The exact number depends on subnet emissions (which change daily) and which models you use (different models price differently). Stake what you can — credits scale linearly with your stake within a subnet.',
  },
  {
    q: 'Which models can I use, and what do they cost?',
    a: 'Morpheus runs a wide menu of open-source models — Llama, Qwen, DeepSeek, Mistral, and more. The full list lives at https://apidocs.mor.org/documentation/models. Per-token pricing per model is at https://apidocs.mor.org/documentation/models/pricing. Your daily API credit allowance from staking gets debited per request based on those prices.',
  },
  {
    q: 'Do credits roll over if I do not use them?',
    a: 'No. Daily allowance refreshes at midnight UTC and any unused credits expire. If you also have prepaid credits in your account ("Available Credit" on the billing page), those persist and are spent when your daily allowance runs out — but only if you have "Allow Overages" enabled on the billing page.',
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
