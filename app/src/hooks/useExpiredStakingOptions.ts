/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';
import { StakingOptions, STAKING_OPTIONS_PK } from '@dual-finance/staking-options';
import { useAnchorProvider } from './useAnchorProvider';
import { decimalsBaseSPL } from '../utils/utils';
import stakingOptionsIdl from '../config/staking_options.json';
import { Config } from '../config/config';
import { SOState } from '../config/types';

export function useExpiredStakingOptions(network: string) {
  const [provider, connection] = useAnchorProvider(network);
  const [accounts, setAccounts] = useState<ExpiredStakingOptionRecords[]>();

  useEffect(() => {
    fetchData(provider).then(setAccounts).catch(console.error);
  }, [connection, network, provider]);

  return accounts;
}

export type ExpiredStakingOptionRecords = Awaited<ReturnType<typeof fetchData>>[number];

async function fetchData(provider: AnchorProvider) {
  const program = new Program(stakingOptionsIdl as Idl, STAKING_OPTIONS_PK, provider);
  const stakingOptionsHelper = new StakingOptions(provider.connection.rpcEndpoint);

  const allAccounts = [];
  const stateAccounts = await provider.connection.getProgramAccounts(STAKING_OPTIONS_PK, {
    filters: [{ dataSize: 1150 }],
  });

  const states = (await program.account.state.fetchMultiple(
    stateAccounts.map((account) => account.pubkey)
  )) as SOState[];

  // For each, check the option mint and look into the ATA
  // eslint-disable-next-line no-restricted-syntax
  for (const [address, state] of Object.entries(states)) {
    const { strikes, soName, baseMint, optionExpiration, quoteMint, authority, lotSize } = state;

    // eslint-disable-next-line no-restricted-syntax
    for (const strike of strikes) {
      const soMint = await stakingOptionsHelper.soMint(strike.toNumber(), soName, new PublicKey(baseMint));
      const baseDecimals = decimalsBaseSPL(Config.pkToAsset(baseMint.toBase58()));
      const quoteDecimals = decimalsBaseSPL(Config.pkToAsset(quoteMint.toBase58()));

      const strikeQuoteAtomsPerLot = Number(strike);
      const strikeQuoteAtomsPerAtom = strikeQuoteAtomsPerLot / lotSize.toNumber();
      const strikeTokensPerToken = strikeQuoteAtomsPerAtom * 10 ** (Number(baseDecimals) - Number(quoteDecimals));
      let roundedStrike = '';
      if (Number(strikeTokensPerToken.toString().split('-')[1]) > 0) {
        roundedStrike = strikeTokensPerToken.toFixed(Number(strikeTokensPerToken.toString().split('-')[1]));
      } else {
        roundedStrike = strikeTokensPerToken.toPrecision(3);
      }

      if (optionExpiration.toNumber() >= Date.now() / 1_000 || soName === 'SO' || soName.includes('LSO')) {
        continue;
      }

      const baseVault = await stakingOptionsHelper.baseVault(soName, baseMint);
      const balance = await provider.connection.getTokenAccountBalance(baseVault);
      const lockedUp = 5_000_000;
      const exercised = lockedUp - (balance.value.uiAmount || 0);
      const notional = exercised * Number(roundedStrike);
      const fees = notional * 0.035;

      console.table({
        address: stateAccounts[Number(address)].pubkey.toString(),
        name: state.soName,
        lockedUp: 5_000_000,
        balance: balance.value.uiAmount,
        exercised,
      });

      const account = {
        key: `${soName}-${soMint.toString()}`,
        name: soName,
        authority: new PublicKey(authority),
        expiration: new Date(Number(optionExpiration) * 1_000).toDateString().split(' ').slice(1).join(' '),
        expirationInt: Number(optionExpiration),
        strike: roundedStrike,
        soMint,
        baseMint: new PublicKey(baseMint),
        quoteMint: new PublicKey(quoteMint),
        exercised,
        notional,
        fees,
      };
      allAccounts.push(account);
    }
  }
  return allAccounts;
}
