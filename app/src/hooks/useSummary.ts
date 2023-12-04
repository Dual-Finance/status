import { useStakingOptions } from './useStakingOptions';

export function useSummary(network: string) {
  const soAccounts = useStakingOptions(network);

  if (!soAccounts) {
    return;
  }

  const tokens = new Map();
  const summary = soAccounts.reduce<SummaryRecords>(
    (acc, account) => {
      const { baseMint, quoteMint } = account;

      const baseAccounted = tokens.has(baseMint.toString()) ? 0 : 1;
      if (baseAccounted) {
        tokens.set(baseMint.toString(), baseMint);
      }

      const quoteAccounted = tokens.has(quoteMint.toString()) ? 0 : 1;
      if (quoteAccounted) {
        tokens.set(quoteMint.toString(), quoteMint);
      }

      return {
        ...acc,
        tokenCount: acc.tokenCount + baseAccounted + quoteAccounted,
        maxFees: acc.maxFees + (account.maxFees || 0),
        maxSettlement: acc.maxSettlement + (account.maxSettlement || 0),
      };
    },
    { tvl: 0, tokenCount: 0, maxFees: 0, maxSettlement: 0 }
  );

  return summary;
}

export interface SummaryRecords {
  tvl: number;
  tokenCount: number;
  maxFees: number;
  maxSettlement: number;
}
