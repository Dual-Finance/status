import { BN } from '@project-serum/anchor';
import { AccountInfo, ParsedAccountData, PublicKey, TokenAmount } from '@solana/web3.js';

export interface SOState {
  soName: string;
  authority: PublicKey;
  optionsAvailable: BN;
  optionExpiration: BN;
  subscriptionPeriodEnd: BN;
  baseDecimals: number;
  quoteDecimals: number;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  quoteAccount: PublicKey;
  lotSize: BN;
  stateBump: number;
  vaultBump: number;
  strikes: BN[];
}

export interface ParsedTokenAccountData extends ParsedAccountData {
  parsed: {
    info: {
      isNative: boolean;
      owner: string;
      mint: string;
      state: string;
      tokenAmount: TokenAmount;
    };
  };
}

export interface ParsedTokenProgramAccount {
  pubkey: PublicKey;
  account: AccountInfo<ParsedTokenAccountData>;
}
