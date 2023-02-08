import { PublicKey } from "@solana/web3.js";

export const STEP_SIZE = 25;
export const MAX_SIGNATURES = 50_000;
export const NEW_ORDER_INSTRUCTION_ID = 13;
export const CANCEL_INSTRUCTION_ID = 7;
export const OPENBOOK_FORK_ID = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
export const OPENBOOK_BONK_MARKET_ID = new PublicKey('8PhnCfgqpgFM7ZJvttGdBVMXHuU4Q23ACxCvWkbs1M71');
export const OPENBOOK_MNGO_MARKET_ID = new PublicKey('3NnxQvDcZXputNMxaxsGvqiKpqgPfSYXpNigZNFcknmD');
export const OPENBOOK_SOL_MARKET_ID = new PublicKey('8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6');
export const TRADING_ACCOUNT = new PublicKey('CkcJx7Uwgxck5zm3DqUp2N1ikkkoPn2wA8zf7oS4tFSZ');
export const DIP_PROGRAM_ID = new PublicKey('DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki');
export const SO_PROGRAM_ID = new PublicKey('4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7');

export const SYMBOL_TO_OPENBOOK_MARKET_ID = {
    'MNGO': OPENBOOK_MNGO_MARKET_ID,
    'SOL': OPENBOOK_SOL_MARKET_ID,
    'BONK': OPENBOOK_BONK_MARKET_ID,
}