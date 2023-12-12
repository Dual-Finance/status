import { DUAL_DAO_WALLET_PK } from '@dual-finance/staking-options';
import { getMultipleAccounts } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { decimalsBaseSPL, fetchMultiBirdeyePrice, getFeeByPair, getSoStrike } from '../utils/utils';
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
      const { baseMint, quoteMint, authority, name, outstanding, strike, lotSize } = account;

      const baseSymbol = Config.pkToAsset(baseMint.toString());
      acc.tokens.set(baseMint.toString(), baseSymbol);
      const quoteSymbol = Config.pkToAsset(quoteMint.toString());
      acc.tokens.set(quoteMint.toString(), quoteSymbol);

      let maxTreasuryFundraise = 0;
      if (
        authority.toString() === DUAL_DAO_WALLET_PK.toString() ||
        (baseMint.toString() === Config.dualMintPk().toString() && name.includes('GSO'))
      ) {
        maxTreasuryFundraise =
          outstanding *
          getSoStrike(
            strike.toNumber(),
            lotSize.toNumber(),
            decimalsBaseSPL(baseSymbol) || 0,
            decimalsBaseSPL(quoteSymbol) || 0
          ) *
          getFeeByPair(baseMint, quoteMint);
      }
      return {
        ...acc,
        maxFees: acc.maxFees + (account.maxFees || 0),
        exerciseValue: acc.exerciseValue + (account.maxSettlement || 0),
        maxTreasuryFundraise: acc.maxTreasuryFundraise + maxTreasuryFundraise,
      };
    },
    { tokens: new Map(), maxFees: 0, exerciseValue: 0, maxTreasuryFundraise: 0 }
  );

  const { maxFees, exerciseValue, maxTreasuryFundraise } = max;
  return {
    totalValueLocked,
    exerciseValue,
    maxFees,
    maxTreasuryFundraise,
    activeTokens: [...max.tokens.values()].sort(),
  };
}

export interface SummaryRecords {
  totalValueLocked: number;
  exerciseValue: number;
  maxFees: number;
  maxTreasuryFundraise: number;
  activeTokens: string[];
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
