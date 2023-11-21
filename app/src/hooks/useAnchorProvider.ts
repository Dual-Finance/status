import { AnchorProvider } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import { GetProvider } from '../utils/utils';

export function useAnchorProvider(network: string): [AnchorProvider, Connection] {
  const wallet = useWallet();
  const [provider, connection] = useMemo(() => {
    return GetProvider(wallet, network, { skipPreflight: false });
  }, [wallet, network]);
  return [provider, connection];
}
