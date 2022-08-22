import { PublicKey } from '@solana/web3.js';

export const API_URL = 'https://dual-rpc.com/mainnet';
export const DUAL_API = 'https://api.dual.finance';

export const dualMarketProgramID = new PublicKey('DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki');
export const stakingOptionsProgramId = new PublicKey('DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8');

export const usdcMintPk = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const wbtcMintPk = new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E');
export const wethMintPk = new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs');
export const wsolMintPk = new PublicKey('So11111111111111111111111111111111111111112');
export const mmWalletPk = new PublicKey('9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ');
export const pythBtcPk = new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU');
export const pythEthPk = new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB');
export const pythSolPk = new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG');

export const ASSETS = {
  BTC: wbtcMintPk,
  ETH: wethMintPk,
  SOL: wsolMintPk,
};

export const LIMIT_FOR_TOKEN = {
  BTC: 0.1,
  ETH: 1,
  SOL: 10,
};

export const PK_TO_ASSET = {
  [wbtcMintPk.toBase58()]: 'BTC',
  [wethMintPk.toBase58()]: 'ETH',
  [wsolMintPk.toBase58()]: 'SOL',
  [usdcMintPk.toBase58()]: 'USDC',
  LSO: 'LSO',
};

export const ASSETS_LIST = [wbtcMintPk.toBase58(), wethMintPk.toBase58(), wsolMintPk.toBase58()];

export const VOL_MAP = {
  [wbtcMintPk.toBase58()]: 0.5,
  [wethMintPk.toBase58()]: 0.6,
  [wsolMintPk.toBase58()]: 0.7,
};

export const VAULT_SPL_ACCOUNT_SEED = 'vault-spl-account';
export const OPTION_MINT_ADDRESS_SEED = 'option-mint';
export const VAULT_MINT_ADDRESS_SEED = 'vault-mint';
export const VAULT_USDC_SEED = 'usdc-vault-account';
export const PREMIUM_USDC_SEED = 'usdc-premium-account';
export const DIP_STATE_SEED = 'dip-state';
