import { AccountInfo, Connection, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { getMint, Mint } from '@solana/spl-token';
import { MintFields, MintJSON } from './types';
import { getMultipleParsedAccountsInChunks } from './utils';

interface MintCache {
  data: MintJSON;
  // TODO: add Metaplex metadata fetching/caching
  metadata?: Record<string, any>;
}

export class MintAccount {
  readonly address: PublicKey;

  readonly decimals: number;

  readonly supply: bigint;

  constructor(mint: MintFields) {
    this.address = mint.address;
    this.decimals = mint.decimals;
    this.supply = mint.supply;
  }

  toJSON(): MintJSON {
    return {
      address: this.address.toString(),
      decimals: this.decimals,
      supply: Number(this.supply),
    };
  }

  static fromJSON(mint: MintJSON): MintAccount {
    return new MintAccount({
      address: new PublicKey(mint.address),
      decimals: mint.decimals,
      supply: BigInt(mint.supply),
    });
  }
}

export async function fetchMintWithCache(connection: Connection, address: PublicKey): Promise<MintAccount> {
  const cacheKey = `mint-${address.toString()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data } = JSON.parse(cached) as MintCache;
    return MintAccount.fromJSON(data);
  }
  const mint = await getMint(connection, address);
  const mintAccount = new MintAccount(mint);
  localStorage.setItem(cacheKey, JSON.stringify({ timestamp: new Date().getTime(), data: mintAccount.toJSON() }));
  return mintAccount;
}

interface ParsedMintAccountData extends ParsedAccountData {
  parsed: {
    info: AccountInfo<Mint>['data'];
    type: 'mint';
  };
}

export async function batchFetchMintWithCache(connection: Connection, addresses: PublicKey[]): Promise<MintAccount[]> {
  const cached = addresses.map((addr) => {
    const cacheKey = `mint-${addr.toString()}`;
    return localStorage.getItem(cacheKey);
  });
  if (cached.every((c) => c !== null)) {
    const mints = cached.map((c) => JSON.parse(c as string) as MintCache).map((c) => MintAccount.fromJSON(c.data));
    return mints;
  }
  const mints = await getMultipleParsedAccountsInChunks<AccountInfo<ParsedMintAccountData>>(connection, addresses);
  const mintAccounts = mints.map((mint, i) => {
    const address = addresses[i];
    const account = new MintAccount({ ...mint.data.parsed.info, address });
    return account;
  });
  mintAccounts.forEach((mintAccount) => {
    const cacheKey = `mint-${mintAccount.address.toString()}`;
    const timestamp = new Date().getTime();
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp, data: mintAccount.toJSON() }));
  });
  return mintAccounts.filter<MintAccount>(isValue);
}

function isValue<T = string>(value: T | null): value is T {
  return value !== null;
}
