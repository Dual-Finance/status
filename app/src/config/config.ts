/* eslint-disable @typescript-eslint/naming-convention */
import { PublicKey } from '@solana/web3.js';

export class Config {
  static isDev = false;

  static apiUrl(): string {
    if (process.env.REACT_APP_RPC) {
      return process.env.REACT_APP_RPC;
    }
    if (Config.isDev) {
      return 'https://solana-devnet.g.alchemy.com/v2/e5EQixWHc-n0F3JTe-ueWzKZIJDMYXTi';
    }
    return 'https://mango.rpcpool.com/946ef7337da3f5b8d3e4a34e7f88';
  }

  static explorerUrl(value: string, explorer = 'solscan', path?: string | null): string {
    // Null or undefined path should resolve to default type of wallet/account/address path
    if (path === null || path === undefined) {
      switch (explorer) {
        case 'solscan':
          path = `account/`;
          break;
        case 'solexplorer':
          path = `address/`;
          break;
        case 'solanafm':
          path = `address/`;
          break;
        default:
          path = ``;
      }
    }

    if (Config.isDev) {
      switch (explorer) {
        case 'solexplorer':
          return `https://explorer.solana.com/${path}${value}?cluster=devnet`;
        case 'solscan':
          return `https://solscan.io/${path}${value}?cluster=devnet`;
        case 'solanafm':
          return `https://solana.fm/${path}${value}?cluster=devnet-qn1`;
        default:
          return ``;
      }
    }

    switch (explorer) {
      case 'solexplorer':
        return `https://explorer.solana.com/${path}${value}`;
      case 'solscan':
        return `https://solscan.io/${path}${value}`;
      case 'solanafm':
        return `https://solana.fm/${path}${value}?cluster=mainnet-solanafmbeta`;
      default:
        return ``;
    }
  }

  static btcMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('JDXktC6gbDXq4zuW3BT6ToSE7timShHQBL449ULDdoMv');
    }
    return new PublicKey('6DNSN2BJsaPFdFFc1zP37kkeNe4Usc1Sqkzr9C9vPWcU');
  }

  static ethMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('Hccuen6RkUgEvyL9oSXW8ai9QiQaAiL8ESaqjp9oymBf');
    }
    return new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk');
  }

  static wbtcpoMintPk(): PublicKey {
    return new PublicKey('3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh');
  }

  static tbtcMintPk(): PublicKey {
    return new PublicKey('6DNSN2BJsaPFdFFc1zP37kkeNe4Usc1Sqkzr9C9vPWcU');
  }

  static wstethpoMintPk(): PublicKey {
    return new PublicKey('ZScHuTtqZukUrtZS43teTKGs2VqkKL8k4QCouR2n6Uo');
  }

  static rethpoMintPk(): PublicKey {
    return new PublicKey('9UV2pC1qPaVMfRv8CF7qhv7ihbzR91pr2LX9y2FDfGLy');
  }

  static wethpoMintPk(): PublicKey {
    return new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs');
  }

  static wsolMintPk(): PublicKey {
    return new PublicKey('So11111111111111111111111111111111111111112');
  }

  static mngoMintPk(): PublicKey {
    return new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac');
  }

  static deanMintPk(): PublicKey {
    return new PublicKey('Ds52CDgqdWbTWsua1hgT3AuSSy4FNx2Ezge1br3jQ14a');
  }

  static allMintPk(): PublicKey {
    return new PublicKey('BaoawH9p2J8yUK9r5YXQs3hQwmUJgscACjmTkh8rMwYL');
  }

  static bonkMintPk(): PublicKey {
    return new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
  }

  static dualMintPk(): PublicKey {
    return new PublicKey('DUALa4FC2yREwZ59PHeu1un4wis36vHRv5hWVBmzykCJ');
  }

  static usdcMintPk(): PublicKey {
    if (Config.isDev) {
      return new PublicKey('HJiQv33nKujRmZQ3sJBSosXgCEmiHs3mG1yd9VcLawPM');
    }
    return new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  }

  static usdtMintPk(): PublicKey {
    return new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
  }

  static daipoMintPk(): PublicKey {
    return new PublicKey('EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o');
  }

  static usdhMintPk(): PublicKey {
    return new PublicKey('USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX');
  }

  static chaiMintPk(): PublicKey {
    return new PublicKey('3jsFX1tx2Z8ewmamiwSU851GzyzM2DJMq7KWW5DM8Py3');
  }

  static guacMintPk(): PublicKey {
    return new PublicKey('AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR');
  }

  static msolMintPk(): PublicKey {
    return new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So');
  }

  static jitosolMintPk(): PublicKey {
    return new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn');
  }

  static slclMintPk(): PublicKey {
    return new PublicKey('SLCLww7nc1PD2gQPQdGayHviVVcpMthnqUz2iWKhNQV');
  }

  static tMintPk(): PublicKey {
    return new PublicKey('4Njvi3928U3figEF5tf8xvjLC5GqUN33oe4XTJNe7xXC');
  }

  static nosMintPk(): PublicKey {
    return new PublicKey('nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7');
  }

  static butterMintPk(): PublicKey {
    return new PublicKey('5cQe5Fo5LnRM5wpaHV7rDyvBHg1cRSyCwDdLRnuQWniu');
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
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'BTC',
      '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 'wBTCpo',
      Hccuen6RkUgEvyL9oSXW8ai9QiQaAiL8ESaqjp9oymBf: 'ETH',
      '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ETH',
      '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'ETH',
      So11111111111111111111111111111111111111112: 'SOL',
      MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: 'MNGO',
      Ds52CDgqdWbTWsua1hgT3AuSSy4FNx2Ezge1br3jQ14a: 'DEAN',
      BaoawH9p2J8yUK9r5YXQs3hQwmUJgscACjmTkh8rMwYL: 'ALL',
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 'BONK',
      HJiQv33nKujRmZQ3sJBSosXgCEmiHs3mG1yd9VcLawPM: 'USDC',
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
      DUALa4FC2yREwZ59PHeu1un4wis36vHRv5hWVBmzykCJ: 'DUAL',
      '3jsFX1tx2Z8ewmamiwSU851GzyzM2DJMq7KWW5DM8Py3': 'CHAI',
      ZScHuTtqZukUrtZS43teTKGs2VqkKL8k4QCouR2n6Uo: 'wstETHpo',
      AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR: 'GUAC',
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: 'mSOL',
      '6DNSN2BJsaPFdFFc1zP37kkeNe4Usc1Sqkzr9C9vPWcU': 'tBTC',
      SLCLww7nc1PD2gQPQdGayHviVVcpMthnqUz2iWKhNQV: 'SLCL',
      '4Njvi3928U3figEF5tf8xvjLC5GqUN33oe4XTJNe7xXC': 'T',
      J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: 'jitoSOL',
      nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7: 'NOS',
      '5cQe5Fo5LnRM5wpaHV7rDyvBHg1cRSyCwDdLRnuQWniu': 'BUTTER',
    };
    // @ts-ignore
    return PK_TO_ASSET[pk];
  }

  static volMap(pk: string): number {
    const VOL_MAP = {
      [Config.btcMintPk().toBase58()]: 0.2,
      [Config.ethMintPk().toBase58()]: 0.25,
      [Config.wsolMintPk().toBase58()]: 0.3,
      [Config.mngoMintPk().toBase58()]: 0.35,
      [Config.bonkMintPk().toBase58()]: 0.35,
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
