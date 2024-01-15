/* eslint-disable @typescript-eslint/naming-convention */
import { PublicKey } from '@solana/web3.js';
import { VariantType } from 'notistack';

export type NOTIFICATION_TYPE = (variant: VariantType, message: string, signature?: string, network?: string) => void;

export interface MintFields {
  address: PublicKey;
  decimals: number;
  supply: bigint;
}

export interface MintJSON {
  address: string;
  decimals: number;
  supply: number;
}
