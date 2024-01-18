import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { REALMS_ADDRESS } from '../config/config';
import { ParsedTokenProgramAccount } from '../config/types';
import { fetchMultiBirdeyePrice } from '../utils/utils';
import { useAnchorProvider } from './useAnchorProvider';

export function useTreasuryInfo(network: string) {
  const [info, setInfo] = useState<TreasuryInfo>();
  const [, connection] = useAnchorProvider(network);

  useEffect(() => {
    fetchData(connection).then(setInfo).catch(console.error);
  }, [connection]);

  return info;
}

async function fetchData(connection: Connection) {
  // 1. you can fetch all token account by an owner
  const response = (await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [{ dataSize: 165 }, { memcmp: { offset: 32, bytes: REALMS_ADDRESS.toString() } }],
  })) as ParsedTokenProgramAccount[];

  const mints = [
    ...response
      .map((info) => info.account.data.parsed.info.mint)
      .reduce((set, mint) => {
        set.add(mint);
        return set;
      }, new Set<string>())
      .values(),
  ];
  const prices = await fetchMultiBirdeyePrice(mints);

  const data = response.reduce<TreasuryInfo>(
    (acc, info) => {
      const { mint } = info.account.data.parsed.info;
      const amount = info.account.data.parsed.info.tokenAmount.uiAmount || 0;
      const value = amount * (prices[mint]?.value || 0);

      return {
        ...acc,
        daoValue: acc.daoValue + value,
        balances: {
          ...acc.balances,
          [mint]: (acc.balances[mint] || 0) + amount,
        },
      };
    },
    { data: response, daoValue: 0, balances: {} }
  );

  return data;
}

interface TreasuryInfo {
  data: ParsedTokenProgramAccount[];
  daoValue: number;
  balances: { [mint: string]: number };
}
