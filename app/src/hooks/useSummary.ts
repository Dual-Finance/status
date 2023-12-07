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

  const summary = soAccounts.reduce(
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

  return { ...summary, tvl, tokenCount: summary.tokens.size };
}

export interface SummaryRecords {
  tvl: number;
  tokenCount: number;
  maxFees: number;
  maxSettlement: number;
}

async function fetchTvl(connection: Connection, soAccounts: SoParams[]) {
  const tvl: { [mint: string]: number } = {};
  const sdk = new StakingOptions(connection.rpcEndpoint);
  // eslint-disable-next-line no-restricted-syntax
  for (const account of soAccounts) {
    const { baseMint } = account;
    const baseVault = await sdk.baseVault(account.name, baseMint);
    const balance = await connection.getTokenAccountBalance(baseVault);
    tvl[baseMint.toString()] = (tvl[baseMint.toString()] || 0) + balance.value.uiAmount!;
  }
  return Object.entries(tvl).reduce((acc, [, value]) => acc + value, 0);
}
