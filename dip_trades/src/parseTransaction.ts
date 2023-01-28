import { TokenBalance, TransactionResponse } from "@solana/web3.js";
import { OPTION_VAULT, USDC_MINT, WSOL_MINT } from "./constants";

export type Payment = {mint: string, amount: number, price: number, time: number};

export function parsePremium(transactionResponse: TransactionResponse): Payment {
    const balancesChanges = getBalanceChanges(transactionResponse.meta.preTokenBalances, transactionResponse.meta.postTokenBalances);
    // Assumes SOL
    let amount = 0;
    for (const balanceChange of balancesChanges) {
        if (balanceChange.mint === WSOL_MINT.toBase58()) {
            amount = balanceChange.amount;
            break;
        }
    }

    let payment = 0;
    for (const balanceChange of balancesChanges) {
        if (balanceChange.mint === USDC_MINT.toBase58()) {
            payment = balanceChange.amount;
            break;
        }
    }

    let mint = '';
    for (const balanceChange of balancesChanges) {
        if (balanceChange.owner === OPTION_VAULT.toBase58()) {
            mint = balanceChange.mint;
            break;
        }
    }

    return {mint: mint, amount: amount, price: payment / amount, time: transactionResponse.blockTime};
}

export function parseMmSale(transactionResponse: TransactionResponse): Payment {
    const balancesChanges = getBalanceChanges(transactionResponse.meta.preTokenBalances, transactionResponse.meta.postTokenBalances);

    // The option vault is involved with the options and it's USDC account
    let amount = 0;
    for (const balanceChange of balancesChanges) {
        if (balanceChange.owner === OPTION_VAULT.toBase58() && balanceChange.mint !== USDC_MINT.toBase58()) {
            amount = balanceChange.amount;
            break;
        }
    }

    let payment = 0;
    for (const balanceChange of balancesChanges) {
        if (balanceChange.mint === USDC_MINT.toBase58()) {
            payment = balanceChange.amount;
            break;
        }
    }

    let mint = '';
    for (const balanceChange of balancesChanges) {
        if (balanceChange.owner === OPTION_VAULT.toBase58()) {
            mint = balanceChange.mint;
            break;
        }
    }

    return {mint: mint, amount: amount, price: payment / amount, time: transactionResponse.blockTime};
}

function getBalanceChanges(preBalances: TokenBalance[], postBalances: TokenBalance[]) {
    let result = [];
    for (let i = 0; i < preBalances.length; ++i) {
        let delta = 0;
        for (let j = 0; j < postBalances.length; ++j) {
            if (preBalances[i].mint === postBalances[j].mint && preBalances[i].owner === postBalances[j].owner) {
                delta += postBalances[j].uiTokenAmount.uiAmount - preBalances[i].uiTokenAmount.uiAmount;
            }
        }
        result.push({
            mint: preBalances[i].mint,
            owner: preBalances[i].owner,
            amount: delta,
        });
    }
    return result;
}