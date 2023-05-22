import { useEffect, useState } from 'react';
import { getDualTokenMeta } from '../utils/utils';

export interface TokenMeta {
  name: string;
  symbol: string;
  decimals: number;
  tokenAuthority: string;
  supply: string;
  type: string;
  address: string;
  icon: string;
}

export default function useTokenMeta() {
  const [tokenMeta, setTokenMeta] = useState<TokenMeta | undefined>();

  useEffect(() => {
    async function fetchData() {
      const newTokenMeta = await getDualTokenMeta();
      return newTokenMeta;
    }

    fetchData()
      .then((data) => {
        if (data) {
          setTokenMeta(data as TokenMeta);
        }
      })
      .catch(console.error);
    return () => setTokenMeta(undefined);
  }, []);

  return {
    tokenMeta,
    setTokenMeta,
  };
}
