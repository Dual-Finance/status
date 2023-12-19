import { getMint } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Config } from '../config/config';
import { useAnchorProvider } from './useAnchorProvider';

export interface TokenMeta {
  decimals: number;
  supply: number;
}

export default function useTokenMeta(network: string) {
  const [tokenMeta, setTokenMeta] = useState<TokenMeta>({ decimals: 6, supply: 0 });
  const [, connection] = useAnchorProvider(network);

  useEffect(() => {
    fetchData(connection).then(setTokenMeta).catch(console.error);
  }, [connection]);

  return {
    tokenMeta,
  };
}

async function fetchData(connection: Connection) {
  const data = await getMint(connection, Config.dualMintPk());
  return {
    decimals: data.decimals,
    supply: Number(data.supply) / 10 ** data.decimals,
  };
}
