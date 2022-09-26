import commaNumber from 'comma-number';
import React from 'react';
import {
  Commitment,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { AnchorProvider, Wallet, web3, utils } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenInstructions } from '@project-serum/serum';
import { dualMarketProgramID, OPTION_MINT_ADDRESS_SEED, Config, VAULT_MINT_ADDRESS_SEED } from '../config/config';

export const prettyFormatNumberWithDecimals = (number: number, decimals: number): string => {
  const rounded: number = Math.floor(number * 10 ** decimals) / 10 ** decimals;
  return commaNumber(rounded);
};

export const prettyFormatNumber = (number: number): string => {
  return commaNumber(number);
};

export const prettyFormatPrice = (price: number): string => {
  return `$${price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

export const formatDate = (date: number | Date): string => {
  const _date = new Date(date);
  return _date.toLocaleDateString();
};

export const getTokenIconClass = (token: string): string => {
  return `${token.toLowerCase()}-icon`;
};

export function useStickyState(defaultValue: any, key: string) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export const TRANSACTION_STEP_WRAP_SOL = 'Wrap SOL';
export const TRANSACTION_STEP_INIT_LSO = 'Initializing LSO';
export const TRANSACTION_STEP_INIT_DEPOSIT_ACCOUNT = 'Initializing Deposit Account';
export const TRANSACTION_STEP_DEPOSITING = 'Depositing';

export const SOL_DEPOSIT_STEPS: string[] = [
  TRANSACTION_STEP_WRAP_SOL,
  TRANSACTION_STEP_INIT_LSO,
  TRANSACTION_STEP_INIT_DEPOSIT_ACCOUNT,
  TRANSACTION_STEP_DEPOSITING,
];

export const SPL_DEPOSIT_STEPS: string[] = [
  TRANSACTION_STEP_INIT_LSO,
  TRANSACTION_STEP_INIT_DEPOSIT_ACCOUNT,
  TRANSACTION_STEP_DEPOSITING,
];

export function GetProvider(wallet: any, network: string): [AnchorProvider, Connection] {
  const connection = new Connection(network, 'confirmed');
  const provider = new AnchorProvider(connection, wallet as Wallet, AnchorProvider.defaultOptions());
  return [provider, connection];
}

export const getMultipleTokenAccounts = async (connection: Connection, keys: string[], commitment: string) => {
  if (keys.length > 100) {
    const batches: string[][] = chunks(keys, 100);
    const batchesPromises: Promise<{ keys: string[]; array: any }>[] = batches.map((batch: string[]) => {
      const result: Promise<{ keys: string[]; array: any }> = getMultipleAccountsCore(
        connection,
        batch,
        commitment,
        'jsonParsed'
      );
      return result;
    });
    const results: { keys: string[]; array: any }[] = await Promise.all<{ keys: string[]; array: any }>(
      batchesPromises
    );
    let allKeys: string[] = [];
    let allArrays: any[] = [];
    results.forEach((result: { keys: string[]; array: any }) => {
      allKeys = allKeys.concat(result.keys);
      allArrays = allArrays.concat(result.array);
    });
    return { keys: allKeys, array: allArrays };
  }

  const result = await getMultipleAccountsCore(connection, keys, commitment, 'jsonParsed');
  const array = result.array.map((acc: { [x: string]: any; data: any }) => {
    if (!acc) {
      return undefined;
    }
    const { data, ...rest } = acc;
    const obj = {
      ...rest,
      data,
    };
    return obj;
  });
  return { keys, array };
};

export function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
    array.slice(index * size, (index + 1) * size)
  );
}

export const getMultipleAccounts = async (connection: Connection, keys: string[], commitment: string | undefined) => {
  const publicKeys: PublicKey[] = [];
  keys.forEach((key) => {
    publicKeys.push(new PublicKey(key));
  });
  const result = await utils.rpc.getMultipleAccounts(connection, publicKeys, commitment as Commitment);

  const array = result
    .map((acc: { account: any; publicKey: PublicKey } | undefined | null) => {
      if (!acc) {
        return undefined;
      }
      return acc.account;
    })
    .filter((_: any) => _);
  return { keys, array };
};

const getMultipleAccountsCore = async (
  connection: Connection,
  keys: string[],
  commitment: string | undefined,
  encoding: string | undefined
): Promise<{ keys: string[]; array: any }> => {
  if (encoding !== 'jsonParsed' && encoding !== 'base64') {
    throw new Error();
  }
  const args = connection._buildArgs([keys], commitment as Commitment, encoding);

  // @ts-ignore
  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args);
  if (unsafeRes.error) {
    throw new Error(`failed to get info about account ${unsafeRes.error.message as string}`);
  }

  if (unsafeRes.result.value) {
    const array = unsafeRes.result.value;
    return { keys, array };
  }

  throw new Error();
};

/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
export function readBigUInt64LE(buffer: Buffer, offset = 0) {
  const first = buffer[offset];
  const last = buffer[offset + 7];
  if (first === undefined || last === undefined) {
    throw new Error();
  }
  const lo = first + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;
  const hi = buffer[++offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
}

export function toBytes(x: number): Uint8Array {
  const y = Math.floor(x / 2 ** 32);
  return Uint8Array.from([y, y << 8, y << 16, y << 24, x, x << 8, x << 16, x << 24].map((z) => z >>> 24));
}
/* eslint-enable no-bitwise */
/* eslint-enable no-plusplus */

export async function getAssociatedTokenAddress(mintPk: PublicKey, owner: PublicKey) {
  return Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mintPk, owner);
}

export async function createTokenAccountInstrs(
  provider: AnchorProvider,
  newAccountPubkey: PublicKey,
  mint: PublicKey,
  owner: PublicKey
) {
  const lamports = await provider.connection.getMinimumBalanceForRentExemption(165);
  return [
    web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey,
      space: 165,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeAccount({
      account: newAccountPubkey,
      mint,
      owner,
    }),
  ];
}

export function createAssociatedTokenAccountInstr(
  pubKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey
) {
  const data = Buffer.alloc(0);
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: pubKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: owner,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  const instr = new TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data,
  });
  return instr;
}

export async function createAssociatedTokenAccount(
  provider: AnchorProvider,
  pubKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey
) {
  const tx = new web3.Transaction();
  tx.add(createAssociatedTokenAccountInstr(pubKey, mint, owner, payer));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await provider.sendAndConfirm(tx);
  return pubKey;
}

export async function createTokenAccount(
  provider: AnchorProvider,
  pubKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey
) {
  const tx: Transaction = new web3.Transaction();
  tx.add(...(await createTokenAccountInstrs(provider, pubKey, mint, owner)));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await provider.sendAndConfirm(tx);
  return pubKey;
}

export async function vaultTokenMintPk(strikePrice: number, expirationInt: number, splMint: PublicKey) {
  const [vaultTokenMint] = await findProgramAddressWithMintAndStrikeAndExpiration(
    VAULT_MINT_ADDRESS_SEED,
    strikePrice,
    expirationInt,
    splMint,
    Config.usdcMintPk(),
    dualMarketProgramID
  );
  return vaultTokenMint;
}

export async function optionTokenMintPk(strikePrice: number, expirationInt: number, splMint: PublicKey) {
  const [optionMint] = await findProgramAddressWithMintAndStrikeAndExpiration(
    OPTION_MINT_ADDRESS_SEED,
    strikePrice,
    expirationInt,
    splMint,
    Config.usdcMintPk(),
    dualMarketProgramID
  );
  return optionMint;
}

export async function vaultTokenAccountPk(
  strikePrice: number,
  expirationInt: number,
  splMint: PublicKey,
  owner: PublicKey
) {
  const vaultTokenMint = await vaultTokenMintPk(strikePrice, expirationInt, splMint);
  return getAssociatedTokenAddress(vaultTokenMint, owner);
}

export async function optionTokenAccountPk(
  strikePrice: number,
  expirationInt: number,
  splMint: PublicKey,
  owner: PublicKey
) {
  const optionMint = await optionTokenMintPk(strikePrice, expirationInt, splMint);
  return getAssociatedTokenAddress(optionMint, owner);
}

export async function findProgramAddressWithMintAndStrikeAndExpiration(
  seed: string,
  strikePrice: number,
  expiration: number,
  splMint: PublicKey,
  usdcMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddress(
    [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Buffer.from(utils.bytes.utf8.encode(seed)),
      toBytes(strikePrice),
      toBytes(expiration),
      splMint.toBuffer(),
      usdcMint.toBuffer(),
    ],
    programId
  );
}

export async function findProgramAddressWithMint(seed: string, mint: PublicKey, programId: PublicKey) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return PublicKey.findProgramAddress([Buffer.from(utils.bytes.utf8.encode(seed)), mint.toBuffer()], programId);
}

export function parseDipState(buf: Buffer) {
  const strike = Number(readBigUInt64LE(buf, 8));
  const expiration = Number(readBigUInt64LE(buf, 16));
  const splMint = new PublicKey(buf.slice(24, 56));
  const vaultMint = new PublicKey(buf.slice(56, 88));
  const vaultMintBump = Number(buf.readUInt8(88));
  const vaultSpl = new PublicKey(buf.slice(89, 121));
  const vaultSplBump = Number(buf.readUInt8(121));
  const optionMint = new PublicKey(buf.slice(122, 154));
  const optionBump = Number(buf.readUInt8(154));
  const vaultUsdc = new PublicKey(buf.slice(155, 187));
  const vaultUsdcBump = Number(buf.readUInt8(187));
  const usdcMint = new PublicKey(buf.slice(188, 220));
  return {
    strike,
    expiration,
    splMint,
    vaultMint,
    vaultMintBump,
    vaultSpl,
    vaultSplBump,
    optionMint,
    optionBump,
    vaultUsdc,
    vaultUsdcBump,
    usdcMint,
  };
}
