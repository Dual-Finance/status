/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Mint } from '@solana/spl-token';
import { AnchorProvider, BN, Idl, Program } from '@project-serum/anchor';
import { DUAL_DAO_WALLET_PK, StakingOptions } from '@dual-finance/staking-options';
import { useAnchorProvider } from './useAnchorProvider';
import { decimalsBaseSPL, fetchMultiBirdeyePrice, getFeeByPair, getSoStrike, isUpsidePool } from '../utils/utils';
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

type ParsedMintAccountData = Omit<ParsedAccountData, 'parsed'> & {
  parsed: AccountInfo<Mint> & {
    info: AccountInfo<Mint>['data'];
  };
};

async function fetchData(provider: AnchorProvider): Promise<SoParams[]> {
  const program = new Program(stakingOptionsIdl as Idl, stakingOptionsProgramId, provider);
  const stakingOptionsHelper = new StakingOptions(provider.connection.rpcEndpoint);

  const allAccounts: SoParams[] = [];
  const data = await provider.connection.getProgramAccounts(stakingOptionsProgramId, { filters: [{ dataSize: 1150 }] });

  const states = (await program.account.state.fetchMultiple(data.map((acc) => acc.pubkey.toString()))) as SOState[];
  const quoteMints = [
    ...states
      .filter((state) => state.quoteMint.toString())
      .reduce<Set<string>>((set, state) => {
        set.add(state.quoteMint.toString());
        return set;
      }, new Set())
      .values(),
  ];
  const prices = await fetchMultiBirdeyePrice(quoteMints);

  const soMints = await Promise.all(
    states.flatMap((state) =>
      // @ts-ignore
      state.strikes.map((strike) => stakingOptionsHelper.soMint(strike, state.soName, state.baseMint))
    )
  );

  const soMintAccounts = (await provider.connection.getMultipleParsedAccounts(soMints)).value.reduce<{
    [mint: string]: ParsedMintAccountData;
  }>(
    (acc, soMintAccount, i) => ({
      ...acc,
      [soMints[i].toString()]: soMintAccount?.data as ParsedMintAccountData,
    }),
    {}
  );

  // For each, check the option mint and look into the ATA
  for (const state of states) {
    const { strikes, soName, baseMint, optionExpiration, quoteMint, optionsAvailable, authority, lotSize } = state;

    for (const strike of strikes) {
      // @ts-ignore
      const soMint = await stakingOptionsHelper.soMint(strike, soName, new PublicKey(baseMint));
      const mint = soMintAccounts[soMint.toString()];
      const outstandingLots = Number(mint.parsed.info.supply);
      const baseDecimals = decimalsBaseSPL(Config.pkToAsset(baseMint.toBase58()));
      const quoteDecimals = decimalsBaseSPL(Config.pkToAsset(quoteMint.toBase58()));
      const outstanding = (outstandingLots * lotSize.toNumber()) / 10 ** Number(baseDecimals);

      // TODO: These are from testing and should be cleaned up.
      if (soName === 'SO' || soName.includes('Buyback Test')) {
        continue;
      }
      const roundedStrike = getSoStrike(
        strike.toNumber(),
        lotSize.toNumber(),
        Number(baseDecimals),
        Number(quoteDecimals)
      );
      const available = Number(optionsAvailable) / 10 ** Number(baseDecimals);
      const roundedAvailable = Math.round(available * 10 ** Number(baseDecimals)) / 10 ** Number(baseDecimals);

      const quotePrice = isUpsidePool(quoteMint) ? 1 : prices[quoteMint.toString()]?.value || 0;
      const maxSettlement = outstanding * roundedStrike * quotePrice;
      const maxFees = maxSettlement * getFeeBasedOnSO(state);

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
        strike,
        strikeQuoteAtomsPerBaseToken: calculateStrikeQuoteAtomsPerBaseToken({
          baseMint,
          quoteMint,
          lotSize: lotSize.toNumber(),
          strikeQuoteAtomsPerLot: strike.toNumber(),
        }),
        lotSize,
        soMint,
        baseMint: new PublicKey(baseMint),
        quoteMint: new PublicKey(quoteMint),
        baseVault: await stakingOptionsHelper.baseVault(soName, baseMint),
        remaining: roundedAvailable,
        outstanding,
        maxSettlement,
        maxFees,
      };
      allAccounts.push(soParams);
    }
  }
  return allAccounts;
}

type FeeBasedOnSoParams = Pick<SOState, 'baseMint' | 'quoteMint' | 'authority' | 'soName'>;
/**
 * Utility function that returns fee multiplier for exercising options,
 * based on https://github.com/Dual-Finance/staking-options/blob/b902c46e0ea78fdf7edf42967b1583c74b995743/programs/staking-options/src/common.rs#L88C18-L88C18
 * */
function getFeeBasedOnSO({ baseMint, quoteMint, authority, soName }: FeeBasedOnSoParams): number {
  // TODO: replace this check with inspection of GSO state's ownership by DAO
  if (
    authority.toString() === DUAL_DAO_WALLET_PK.toString() ||
    (baseMint.toString() === Config.dualMintPk().toString() && soName.includes('GSO'))
  ) {
    return 0;
  }

  return getFeeByPair(baseMint, quoteMint);
}

export interface SoParams {
  // Just needed for react
  key: React.Key;
  name: string;
  authority: PublicKey;
  expiration: string;
  expirationInt: number;
  strike: BN;
  strikeQuoteAtomsPerBaseToken: number;
  lotSize: BN;
  soMint: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseVault: PublicKey;
  remaining: number;
  outstanding: number;
  maxSettlement: number;
  maxFees: number;
}

function calculateStrikeQuoteAtomsPerBaseToken(data: {
  baseMint: PublicKey;
  quoteMint: PublicKey;
  lotSize: number;
  strikeQuoteAtomsPerLot: number;
}) {
  const isUpside = isUpsidePool(data.quoteMint);
  const baseDecimals = decimalsBaseSPL(Config.pkToAsset(data.baseMint.toString())) ?? 1;
  const quoteDecimals = decimalsBaseSPL(Config.pkToAsset(data.quoteMint.toString())) ?? 1;
  return isUpside
    ? (data.strikeQuoteAtomsPerLot / data.lotSize) * 10 ** (baseDecimals - quoteDecimals)
    : Number(((1 / data.strikeQuoteAtomsPerLot) * 10 ** quoteDecimals).toPrecision(6));
}
