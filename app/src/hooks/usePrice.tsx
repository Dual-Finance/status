import { parsePriceData } from '@pythnetwork/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { getMultipleAccounts, GetProvider } from '../utils/utils';

export default function usePrice(network: string) {
  const wallet = useWallet();
  const [prices, setPrices] = useState<number[]>([]);
  const [, localConnection] = GetProvider(wallet, network);

  const fetchPrices = async (publicKeys: string[]) => {
    try {
      const priceInfos = await getMultipleAccounts(localConnection, publicKeys, 'confirmed');

      const freshPrices: number[] = priceInfos.array.map((item: any) => parsePriceData(item.data as Buffer).price || 0);

      setPrices(freshPrices);
    } catch (error) {
      // Do nothing. This will retry
      console.log(error);
      setPrices([]);
    }
  };

  return {
    fetchPrices,
    prices,
  };
}
