import { StakingOptions } from '@dual-finance/staking-options';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useAnchorProvider } from './useAnchorProvider';
import { SoParams, useStakingOptions } from './useStakingOptions';

export function useSummary(network: string) {
  const [, connection] = useAnchorProvider(network);
  const soAccounts = useStakingOptions(network);
  const [tvl, setTvl] = useState<number>();

  useEffect(() => {
    if (!soAccounts) {
      return;
    }

    fetchTvl(connection, soAccounts).then(setTvl).catch(console.error);
  }, [connection, soAccounts]);

  if (!soAccounts || !tvl) {
    return;
  }

  const max = soAccounts.reduce(
    (acc, account) => {
      const { baseMint, quoteMint } = account;

      acc.tokens.set(baseMint.toString(), baseMint);
      acc.tokens.set(quoteMint.toString(), quoteMint);

      return {
        ...acc,
        maxFees: acc.maxFees + (account.maxFees || 0),
        maxSettlement: acc.maxSettlement + (account.maxSettlement || 0),
      };
    },
    { tokens: new Map(), maxFees: 0, maxSettlement: 0 }
  );

  const { maxFees, maxSettlement } = max;
  return { tvl, tokenCount: max.tokens.size, maxFees, maxSettlement };
}

export interface SummaryRecords {
  tvl: number;
  tokenCount: number;
  maxFees: number;
  maxSettlement: number;
}

async function fetchTvl(connection: Connection, soAccounts: SoParams[]) {
  const sdk = new StakingOptions(connection.rpcEndpoint);

  const tvl: { [mint: string]: number } = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const account of soAccounts) {
    const { baseMint } = account;
    const baseVault = await sdk.baseVault(account.name, baseMint);
    const balance = await connection.getTokenAccountBalance(baseVault);
    tvl[baseMint.toString()] = (tvl[baseMint.toString()] || 0) + (balance.value.uiAmount || 0);
  }

  const prices: { [mint: string]: number } = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const mint of Object.keys(tvl)) {
    const price = await fetchBirdeyePrice(mint);
    prices[mint] = price;
  }

  return Object.entries(tvl).reduce((acc, [mint, value]) => acc + value * prices[mint], 0);
}

async function fetchBirdeyePrice(address: string) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options = { method: 'GET', headers: { 'X-API-KEY': process.env.REACT_APP_BIRDEYE_API_KEY || '' } };

  try {
    const data = await fetch(`https://public-api.birdeye.so/public/price?address=${address}`, options);
    const priceData = await data.json();
    // Needed to avoid rate-limiting (30req/m on public api)
    await sleep(2000);
    return priceData.data.value;
  } catch (e) {
    return 0;
  }
}

function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}
