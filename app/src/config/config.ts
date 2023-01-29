import { PublicKey } from '@solana/web3.js';

export class Config {
  static isDev = false;

  static apiUrl(): string {
    if (Config.isDev) {
      return 'https://solana-devnet.g.alchemy.com/v2/e5EQixWHc-n0F3JTe-ueWzKZIJDMYXTi';
    }
    return 'https://solana-mainnet.g.alchemy.com/v2/UxG4nAwZ_FG0ueIajZM4BXJc8UC62QTI';
  }

  static sobtcMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('JDXktC6gbDXq4zuW3BT6ToSE7timShHQBL449ULDdoMv');
    }
    return new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E');
  }

  static soethMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('Hccuen6RkUgEvyL9oSXW8ai9QiQaAiL8ESaqjp9oymBf');
    }
    return new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk');
  }

  static wsolMintPk(): PublicKey {
    return new PublicKey('So11111111111111111111111111111111111111112');
  }

  static mngoMintPk(): PublicKey {
    return new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac');
  }

  static bonkMintPk(): PublicKey {
    return new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
  }

  static usdcMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('HJiQv33nKujRmZQ3sJBSosXgCEmiHs3mG1yd9VcLawPM');
    }
    return new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  }

  static pythBtcPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J');
    }
    return new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU');
  }

  static pythEthPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw');
    }
    return new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB');
  }

  static pythSolPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');
    }
    return new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG');
  }

  static pkToAsset(pk: string): string {
    const PK_TO_ASSET = {
      JDXktC6gbDXq4zuW3BT6ToSE7timShHQBL449ULDdoMv: 'BTC',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'BTC',
      Hccuen6RkUgEvyL9oSXW8ai9QiQaAiL8ESaqjp9oymBf: 'ETH',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ETH',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'ETH',
      So11111111111111111111111111111111111111112: 'SOL',
      MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: 'MNGO',
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 'BONK',
      HJiQv33nKujRmZQ3sJBSosXgCEmiHs3mG1yd9VcLawPM: 'USDC',
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
    };
    // @ts-ignore
    return PK_TO_ASSET[pk];
  }

  static volMap(pk: string): number {
    const VOL_MAP = {
      [Config.sobtcMintPk().toBase58()]: 0.3,
      [Config.soethMintPk().toBase58()]: 0.4,
      [Config.wsolMintPk().toBase58()]: 0.5,
      [Config.mngoMintPk().toBase58()]: 0.6,
      [Config.bonkMintPk().toBase58()]: 1,
    };
    return VOL_MAP[pk];
  }
}

export const dualMarketProgramID = new PublicKey('DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki');
export const stakingOptionsProgramId = new PublicKey('4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7');
export const gsoId = new PublicKey('DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8');
export const mmWalletPk = new PublicKey('9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ');

export const LIMIT_FOR_TOKEN = {
  BTC: 0.1,
  ETH: 1,
  SOL: 10,
};

export const VAULT_SPL_ACCOUNT_SEED = 'vault-spl-account';
export const OPTION_MINT_ADDRESS_SEED = 'option-mint';
export const VAULT_MINT_ADDRESS_SEED = 'vault-mint';
export const VAULT_USDC_SEED = 'usdc-vault-account';
export const PREMIUM_USDC_SEED = 'usdc-premium-account';
export const DIP_STATE_SEED = 'dip-state';
export const rfRate = 0.03; // Risk Free Rate of Return ~ T-Bill Rate
