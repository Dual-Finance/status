import { getMultipleAccounts } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { decimalsBaseSPL } from '../utils/utils';
import { useAnchorProvider } from './useAnchorProvider';
import { DipParams, useDips } from './useDips';
import { GsoParams, useGso } from './useGso';
import { SoParams, useStakingOptions } from './useStakingOptions';

export function useSummary(network: string): SummaryRecords | undefined {
  const [, connection] = useAnchorProvider(network);
  const soAccounts = useStakingOptions(network);
  const dipAccounts = useDips(network);
  const gsoAccounts = useGso(network);
  const [totalValueLocked, setTotalValueLocked] = useState<number>();

  useEffect(() => {
    if (!soAccounts || !dipAccounts || !gsoAccounts) {
      return;
    }

    fetchTvl(connection, soAccounts, dipAccounts, gsoAccounts).then(setTotalValueLocked).catch(console.error);
  }, [connection, dipAccounts, soAccounts, gsoAccounts]);

  if (!soAccounts || !dipAccounts || !gsoAccounts || !totalValueLocked) {
    return;
  }

  const max = soAccounts.reduce(
    (acc, account) => {
      const { baseMint, quoteMint } = account;

      acc.tokens.set(baseMint.toString(), Config.pkToAsset(baseMint.toString()));
      acc.tokens.set(quoteMint.toString(), Config.pkToAsset(quoteMint.toString()));

      return {
        ...acc,
        maxFees: acc.maxFees + (account.maxFees || 0),
        maxSettlement: acc.maxSettlement + (account.maxSettlement || 0),
      };
    },
    { tokens: new Map(), maxFees: 0, maxSettlement: 0 }
  );

  const { maxFees, maxSettlement } = max;
  return {
    totalValueLocked,
    partnerTokens: [...max.tokens.values()].sort(),
    maxFees,
    maxSettlement,
  };
}

export interface SummaryRecords {
  totalValueLocked: number;
  partnerTokens: string[];
  maxFees: number;
  maxSettlement: number;
}

async function fetchTvl(
  connection: Connection,
  soAccounts: SoParams[],
  dipAccounts: DipParams[],
  gsoAccounts: GsoParams[]
) {
  const accounts = await getMultipleAccounts(connection, [
    ...soAccounts.map((account) => account.baseVault),
    ...dipAccounts.map((account) => account.vaultSpl),
    ...dipAccounts.map((account) => account.vaultUsdc),
    ...gsoAccounts.map((account) => account.baseVault),
  ]);

  const tvl = accounts.reduce<{ [mint: string]: number }>((acc, account) => {
    const { mint, amount } = account;
    const decimals = decimalsBaseSPL(Config.pkToAsset(mint.toString())) || 0;
    // ignore balance if decimals are not available
    const balance = decimals ? Number(amount.toString()) / 10 ** decimals : 0;
    return {
      ...acc,
      [mint.toString()]: (acc[mint.toString()] || 0) + balance,
    };
  }, {});

  const prices = await fetchMultiBirdeyePrice(Object.keys(tvl));

  return Object.entries(tvl).reduce((acc, [mint, value]) => acc + value * (prices[mint]?.value || 0), 0);
}

interface BirdeyePrice {
  // Birdeye can return a value for recognized address, null if not enough liquidity or undefined if not recognized
  [mint: string]: { value: number | null } | undefined;
}

async function fetchMultiBirdeyePrice(addresses: string[]): Promise<BirdeyePrice> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options = { method: 'GET', headers: { 'X-API-KEY': process.env.REACT_APP_BIRDEYE_API_KEY || '' } };
  const addressList = encodeURIComponent(addresses.join(','));

  try {
    const data = await fetch(`https://public-api.birdeye.so/public/multi_price?list_address=${addressList}`, options);
    const priceData = await data.json();
    return priceData.data;
  } catch (e) {
    return {};
  }
}
