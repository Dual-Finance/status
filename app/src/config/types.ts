import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

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
