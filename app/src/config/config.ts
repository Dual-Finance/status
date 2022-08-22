import { PublicKey } from '@solana/web3.js';

export const API_URL = 'https://dual-rpc.com/devnet';
export const DUAL_API = 'https://dev.api.dual.finance';

export const dualMarketProgramID = new PublicKey('DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki');
export const stakingOptionsProgramId = new PublicKey('DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8');

export const usdcMintPk = new PublicKey('HJiQv33nKujRmZQ3sJBSosXgCEmiHs3mG1yd9VcLawPM');
export const wbtcMintPk = new PublicKey('JDXktC6gbDXq4zuW3BT6ToSE7timShHQBL449ULDdoMv');
export const wethMintPk = new PublicKey('Hccuen6RkUgEvyL9oSXW8ai9QiQaAiL8ESaqjp9oymBf');
export const wsolMintPk = new PublicKey('So11111111111111111111111111111111111111112');
export const mmWalletPk = new PublicKey('9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ');
export const pythBtcPk = new PublicKey('HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J');
export const pythEthPk = new PublicKey('EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw');
export const pythSolPk = new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

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
