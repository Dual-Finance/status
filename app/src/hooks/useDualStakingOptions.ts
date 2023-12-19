/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Mint } from '@solana/spl-token';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';
import { StakingOptions } from '@dual-finance/staking-options';
import { useAnchorProvider } from './useAnchorProvider';
import { decimalsBaseSPL, getMultipleParsedAccountsInChunks } from '../utils/utils';
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

interface ParsedMintAccountData extends ParsedAccountData {
  parsed: {
    info: AccountInfo<Mint>['data'];
  };
}

async function fetchData(provider: AnchorProvider): Promise<StakingOptionAccount[]> {
  const program = new Program(stakingOptionsIdl as Idl, stakingOptionsProgramId, provider);
  const stakingOptionsHelper = new StakingOptions(provider.connection.rpcEndpoint);

  const accounts = [];
  const data = await provider.connection.getProgramAccounts(stakingOptionsProgramId, { filters: [{ dataSize: 1150 }] });

  const states = (await program.account.state.fetchMultiple(data.map((acc) => acc.pubkey.toString()))) as SOState[];

  const soMints = await Promise.all(
    states.flatMap((state) =>
      // @ts-ignore
      state.strikes.map((strike) => stakingOptionsHelper.soMint(strike, state.soName, state.baseMint))
    )
  );

  // TODO: cache SO mint accounts since these never change
  const soMintAccounts = (await getMultipleParsedAccountsInChunks(provider.connection, soMints)).reduce<{
    [mint: string]: ParsedMintAccountData;
  }>(
    (acc, soMintAccount, i) => ({
      ...acc,
      [soMints[i].toString()]: soMintAccount?.data as ParsedMintAccountData,
    }),
    {}
  );

  for (const [i, state] of states.entries()) {
    const { strikes, soName, baseMint, quoteMint, optionsAvailable, lotSize } = state;

    for (const strike of strikes) {
      if (baseMint.toString() !== Config.dualMintPk().toString()) {
        continue;
      }
      const soMint = await stakingOptionsHelper.soMint(strike.toNumber(), soName, new PublicKey(baseMint));
      const mint = soMintAccounts[soMint.toString()];
      const outstandingLots = Number(mint.parsed.info.supply);
      const baseDecimals = decimalsBaseSPL(Config.pkToAsset(baseMint.toString()));
      const outstanding = (outstandingLots * lotSize.toNumber()) / 10 ** Number(baseDecimals);

      const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
      const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

      const account: StakingOptionAccount = {
        key: data[i].pubkey.toString(),
        name: soName,
        soMint,
        baseMint: new PublicKey(baseMint),
        quoteMint: new PublicKey(quoteMint),
        remaining: (roundedAvailable / lotSize.toNumber()) * 10 ** Number(baseDecimals),
        outstanding,
      };
      accounts.push(account);
    }
  }
  return accounts;
}

export interface StakingOptionAccount {
  key: string;
  name: string;
  soMint: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  remaining: number;
  outstanding: number;
}
