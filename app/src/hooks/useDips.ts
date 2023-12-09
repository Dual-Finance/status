import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { dualMarketProgramID } from '../config/config';
import { parseDipState } from '../utils/utils';
import { useAnchorProvider } from './useAnchorProvider';

export function useDips(network: string) {
  const [, connection] = useAnchorProvider(network);
  const [accounts, setAccounts] = useState<DipParams[]>();

  useEffect(() => {
    fetchData(connection).then(setAccounts).catch(console.error);
  }, [connection, network]);

  return accounts;
}

async function fetchData(connection: Connection) {
  const dipParams: DipParams[] = [];
  const programAccounts = await connection.getProgramAccounts(dualMarketProgramID, { filters: [{ dataSize: 260 }] });

  // eslint-disable-next-line no-restricted-syntax
  for (const programAccount of programAccounts) {
    const dipState = parseDipState(programAccount.account.data);

    const { expiration, splMint, usdcMint, strike, vaultSpl, vaultUsdc } = dipState;

    const durationMs = expiration * 1_000 - Date.now();
    if (durationMs < 0) {
      // eslint-disable-next-line no-continue
      continue;
    }

    dipParams.push({
      key: programAccount.pubkey.toString(),
      address: programAccount.pubkey,
      expiration,
      strike,
      splMint,
      usdcMint,
      vaultSpl,
      vaultUsdc,
    });
  }

  return dipParams;
}

export interface DipParams {
  key: React.Key;
  // Public key of the DIP account
  address: PublicKey;
  // Expiration in seconds since epoch
  expiration: number;
  // Strike price for the DIP
  strike: number;
  // Mint of the base token
  splMint: PublicKey;
  // Mint of the quote token
  usdcMint: PublicKey;
  // Vault for base tokens
  vaultSpl: PublicKey;
  // Vault for quote tokens
  vaultUsdc: PublicKey;
}
