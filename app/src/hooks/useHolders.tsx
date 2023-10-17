import { useEffect, useState } from 'react';
import { getDualHolders } from '../utils/utils';

export interface Holder {
  address: string;
  amount: number;
  decimals: number;
  owner: string;
  rank: number;
}

export interface Holders {
  data: Holder[];
  total: number;
}

export default function useHolders() {
  const [holders, setHolders] = useState<Holders>({ data: [], total: 0 });

  useEffect(() => {
    async function fetchData() {
      const newHolders = await getDualHolders();
      return newHolders;
    }

    fetchData()
      .then((data) => {
        if (data) {
          setHolders(data as Holders);
        }
      })
      .catch(console.error);
    return () => setHolders({ data: [], total: 0 });
  }, []);

  return {
    holders,
    setHolders,
  };
}
