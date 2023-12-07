import { getMultipleAccounts } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { decimalsBaseSPL } from '../utils/utils';
import { useAnchorProvider } from './useAnchorProvider';
import { DipParams, useDips } from './useDips';
import { GsoParams, useGso } from './useGso';
import { SoParams, useStakingOptions } from './useStakingOptions';

export function useSummary(network: string) {
  const [, connection] = useAnchorProvider(network);
  const soAccounts = useStakingOptions(network);
  const dipAccounts = useDips(network);
  const gsoAccounts = useGso(network);
  const [tvl, setTvl] = useState<number>();

  useEffect(() => {
    if (!soAccounts || !dipAccounts || !gsoAccounts) {
      return;
    }

    fetchTvl(connection, soAccounts, dipAccounts, gsoAccounts).then(setTvl).catch(console.error);
  }, [connection, dipAccounts, soAccounts, gsoAccounts]);

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

async function fetchTvl(
  connection: Connection,
  soAccounts: SoParams[],
  dipAccounts: DipParams[],
  gsoAccounts: GsoParams[]
) {
  const tvl: { [mint: string]: number } = {};
  const soTokenAccounts = await Promise.all(soAccounts.map((account) => account.baseVault));
  const dipBaseTokenAccounts = dipAccounts.map((account) => account.vaultSpl);
  const dipQuoteTokenAccounts = dipAccounts.map((account) => account.vaultUsdc);
  const gsoBaseTokenAccounts = gsoAccounts.map((account) => account.baseVault);
  const accounts = await getMultipleAccounts(connection, [
    ...soTokenAccounts,
    ...dipBaseTokenAccounts,
    ...dipQuoteTokenAccounts,
    ...gsoBaseTokenAccounts,
  ]);

  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    const { mint, amount } = account;
    const decimals = decimalsBaseSPL(Config.pkToAsset(mint.toString())) || 0;
    tvl[mint.toString()] = (tvl[mint.toString()] || 0) + (decimals ? Number(amount.toString()) / 10 ** decimals : 0);
  }

  const prices: { [mint: string]: { value: number | null } } = await fetchMultiBirdeyePrice(Object.keys(tvl));

  return Object.entries(tvl).reduce((acc, [mint, value]) => acc + value * (prices[mint]?.value || 0), 0);
}

async function fetchMultiBirdeyePrice(addresses: string[]) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options = { method: 'GET', headers: { 'X-API-KEY': process.env.REACT_APP_BIRDEYE_API_KEY || '' } };
  const addressList = encodeURIComponent(addresses.join(','));

  try {
    const data = await fetch(`https://public-api.birdeye.so/public/multi_price?list_address=${addressList}`, options);
    const priceData = await data.json();
    return priceData.data;
  } catch (e) {
    return 0;
  }
}
