import { useEffect, useState } from 'react';
import { GSO } from '@dual-finance/gso';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAnchorProvider } from './useAnchorProvider';
import { parseGsoState } from '../utils/utils';
import { gsoId } from '../config/config';

export function useGso(network: string) {
  const [, connection] = useAnchorProvider(network);
  const [accounts, setAccounts] = useState<GsoParams[]>();

  useEffect(() => {
    fetchData(connection).then(setAccounts).catch(console.error);
  }, [connection]);

  return accounts;
}

async function fetchData(connection: Connection) {
  const gso = new GSO(connection.rpcEndpoint);

  const gsoStates = await connection.getProgramAccounts(gsoId, {
    filters: [{ dataSize: 1000 }],
  });
  const gsoParams = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const gsoState of gsoStates) {
    const { soName, stakingOptionsState, subscriptionPeriodEnd, strike, lockupRatioTokensPerMillion, baseMint } =
      parseGsoState(gsoState.account.data);
    const lockupRatio = lockupRatioTokensPerMillion / 1_000_000;
    const stakeTimeRemainingMs = subscriptionPeriodEnd * 1_000 - Date.now();
    const isTesting =
      soName.toLowerCase().includes('test') || soName.toLowerCase().includes('trial') || soName === 'DUAL-Lockup-1';

    if (stakeTimeRemainingMs <= 0 || lockupRatio <= 0 || strike <= 0 || isTesting) {
      // eslint-disable-next-line no-continue
      continue;
    }

    gsoParams.push({
      key: gsoState.pubkey.toString(),
      address: gsoState.pubkey,
      soName,
      strike,
      baseMint,
      subscriptionPeriodEnd,
      lockupRatio,
      soStatePk: stakingOptionsState,
      baseVault: await gso.baseVault(gsoState.pubkey),
    });
  }
  return gsoParams;
}

export interface GsoParams {
  key: React.Key;
  // Public key of the GSO account
  address: PublicKey;
  // Name of the GSO
  soName: string;
  // Strike price for the SO
  strike: number;
  // Mint of the base token
  baseMint: PublicKey;
  // Point in time until subscription period ends
  subscriptionPeriodEnd: number;
  // Ratio of deposited tokens to options received
  lockupRatio: number;
  // Address of SO state
  soStatePk: PublicKey;
  // Vault for base tokens
  baseVault: PublicKey;
}
