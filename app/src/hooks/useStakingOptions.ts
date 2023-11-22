/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';
import { StakingOptions } from '@dual-finance/staking-options';
import { useAnchorProvider } from './useAnchorProvider';
import { decimalsBaseSPL } from '../utils/utils';
import stakingOptionsIdl from '../config/staking_options.json';
import { Config, stakingOptionsProgramId } from '../config/config';
import { SOState } from '../config/types';

export function useStakingOptions(network: string) {
  const [provider] = useAnchorProvider(network);
  const [accounts, setAccounts] = useState<SoParams[]>();

  useEffect(() => {
    fetchData(provider).then(setAccounts).catch(console.error);
  }, [network, provider]);

  return accounts;
}

async function fetchData(provider: AnchorProvider): Promise<SoParams[]> {
  const program = new Program(stakingOptionsIdl as Idl, stakingOptionsProgramId, provider);
  const stakingOptionsHelper = new StakingOptions(provider.connection.rpcEndpoint);

  const allAccounts: SoParams[] = [];
  const data = await provider.connection.getProgramAccounts(stakingOptionsProgramId, { filters: [{ dataSize: 1150 }] });

  const states = (await program.account.state.fetchMultiple(data.map((acc) => acc.pubkey.toString()))) as SOState[];

  // For each, check the option mint and look into the ATA
  for (const state of states) {
    const { strikes, soName, baseMint, optionExpiration, quoteMint, optionsAvailable, authority, lotSize } = state;

    for (const strike of strikes) {
      // @ts-ignore
      const soMint = await stakingOptionsHelper.soMint(strike, soName, new PublicKey(baseMint));
      const baseDecimals = decimalsBaseSPL(Config.pkToAsset(baseMint.toBase58()));
      const quoteDecimals = decimalsBaseSPL(Config.pkToAsset(quoteMint.toBase58()));
      let outstanding = 0;
      try {
        const mint = await getMint(provider.connection, soMint);
        const outstandingLots = Number(mint.supply);
        outstanding = (outstandingLots * lotSize.toNumber()) / 10 ** Number(baseDecimals);
      } catch (err) {
        console.log(err);
      }

      // TODO: These are from testing and should be cleaned up.
      if (soName === 'SO') {
        continue;
      }
      const strikeQuoteAtomsPerLot = Number(strike);
      const strikeQuoteAtomsPerAtom = strikeQuoteAtomsPerLot / lotSize.toNumber();
      const strikeTokensPerToken = strikeQuoteAtomsPerAtom * 10 ** (Number(baseDecimals) - Number(quoteDecimals));
      let roundedStrike = '';
      if (Number(strikeTokensPerToken.toString().split('-')[1]) > 0) {
        roundedStrike = strikeTokensPerToken.toFixed(Number(strikeTokensPerToken.toString().split('-')[1]));
      } else {
        roundedStrike = strikeTokensPerToken.toPrecision(3);
      }
      const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
      const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

      const maxFees = outstanding * Number(roundedStrike);

      // These should be cleaned up, but do not have anything in them, so dont display.
      if (optionExpiration.toNumber() < Date.now() / 1_000 && roundedAvailable === 0) {
        continue;
      }

      const soParams = {
        key: `${soName}-${soMint.toString()}`,
        name: soName,
        authority: new PublicKey(authority),
        expiration: new Date(Number(optionExpiration) * 1_000).toDateString().split(' ').slice(1).join(' '),
        expirationInt: Number(optionExpiration),
        strike: roundedStrike,
        soMint,
        baseMint: new PublicKey(baseMint),
        quoteMint: new PublicKey(quoteMint),
        remaining: roundedAvailable,
        outstanding,
        maxFees,
      };
      allAccounts.push(soParams);
    }
  }
  return allAccounts;
}

export interface SoParams {
  // Just needed for react
  key: React.Key;
  name: string;
  authority: PublicKey;
  expiration: string;
  expirationInt: number;
  strike: string;
  soMint: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  remaining: number;
  outstanding: number;
  maxFees: number;
}
