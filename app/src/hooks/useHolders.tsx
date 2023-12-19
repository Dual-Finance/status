import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, ParsedAccountData, PublicKey, TokenAmount } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { useAnchorProvider } from './useAnchorProvider';

export interface Holder {
  address: string;
  amount: number;
  owner: string;
  rank: number;
}

export interface HolderData {
  data: Holder[];
  total: number;
}

export default function useHolders(network: string) {
  const [holders, setHolders] = useState<HolderData>({ data: [], total: 0 });
  const [, connection] = useAnchorProvider(network);

  useEffect(() => {
    fetchDualHolders(connection).then(setHolders).catch(console.error);
  }, [connection]);

  return {
    holders,
  };
}

interface ParsedTokenAccountData extends ParsedAccountData {
  parsed: {
    info: {
      owner: string;
      tokenAmount: TokenAmount;
    };
  };
}

type ParsedProgramAccount = {
  pubkey: PublicKey;
  account: { data: ParsedTokenAccountData };
};

async function fetchDualHolders(connection: Connection) {
  const data = (await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: Config.dualMintPk().toString() } }],
  })) as unknown as ParsedProgramAccount[];

  return [...data]
    .sort(
      (a, b) =>
        (b.account.data.parsed.info.tokenAmount.uiAmount || 0) - (a.account.data.parsed.info.tokenAmount.uiAmount || 0)
    )
    .reduce<HolderData>(
      (acc, programAccount, i) => {
        return {
          data: [
            ...acc.data,
            {
              address: programAccount.pubkey.toString(),
              amount: programAccount.account.data.parsed.info.tokenAmount.uiAmount || 0,
              owner: programAccount.account.data.parsed.info.owner,
              rank: i,
            },
          ],
          total: acc.total + 1,
        };
      },
      { data: [], total: 0 }
    );
}
