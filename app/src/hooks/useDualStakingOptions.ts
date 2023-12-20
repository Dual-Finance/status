/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';
import { useAnchorProvider } from './useAnchorProvider';
import { decimalsBaseSPL } from '../utils/utils';
import stakingOptionsIdl from '../config/staking_options.json';
import { Config, stakingOptionsProgramId } from '../config/config';
import { SOState } from '../config/types';

export function useDualStakingOptions(network: string) {
  const [provider] = useAnchorProvider(network);
  const [accounts, setAccounts] = useState<StakingOptionAccount[]>();

  useEffect(() => {
    fetchData(provider).then(setAccounts).catch(console.error);
  }, [network, provider]);

  return accounts;
}

async function fetchData(provider: AnchorProvider): Promise<StakingOptionAccount[]> {
  const program = new Program(stakingOptionsIdl as Idl, stakingOptionsProgramId, provider);
  const data = await provider.connection.getProgramAccounts(stakingOptionsProgramId, { filters: [{ dataSize: 1150 }] });

  const states = (await program.account.state.fetchMultiple(data.map((acc) => acc.pubkey.toString()))) as SOState[];

  const accounts = states.reduce<StakingOptionAccount[]>((acc, state, i) => {
    const { strikes, soName, baseMint, quoteMint, optionsAvailable, lotSize } = state;
    if (baseMint.toString() !== Config.dualMintPk().toString()) {
      return acc;
    }
    return [
      ...acc,
      ...strikes.reduce<StakingOptionAccount[]>((accountsInState) => {
        const baseDecimals = decimalsBaseSPL(Config.pkToAsset(baseMint.toString()));
        const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
        const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

        const account: StakingOptionAccount = {
          key: data[i].pubkey.toString(),
          soName,
          baseMint,
          quoteMint,
          balance: (roundedAvailable * lotSize.toNumber()) / 10 ** Number(baseDecimals),
        };
        return [...accountsInState, account];
      }, []),
    ];
  }, []);

  return accounts;
}

export interface StakingOptionAccount {
  key: string;
  soName: string;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  balance: number;
}
