import { TransactionResponse } from "@solana/web3.js";
import { CANCEL_INSTRUCTION_ID, NEW_ORDER_INSTRUCTION_ID } from "./constants";
const bs58 = require('bs58')

// Parse the transaction and return a list of events
export async function parseTransaction(transactionResponse: TransactionResponse) {
    const message = transactionResponse.transaction.message;
    for (const instruction of message.instructions) {
        if (instruction.programIdIndex === CANCEL_INSTRUCTION_ID) {
            const payload = bs58.decode(instruction.data);

            // This is for cancelling by client order id can be ignored
            if (payload.length !== 25) {
                continue;
            }
            const buf = Buffer.alloc(25, payload);

            const limitPrice = buf.readBigUInt64LE(17);

            // Use the way that order ids are generated to determine the order that was cancelled.
            // https://github.com/openbook-dex/program/blob/b6a5cf11c87b3ae4021cde5e2c0ff83d64814902/dex/src/state.rs#L908
            console.log(`Cancel price:${limitPrice}  blockTime:${transactionResponse.blockTime}`);
        }

        if (instruction.programIdIndex === NEW_ORDER_INSTRUCTION_ID) {
            const payload = bs58.decode(instruction.data);

            // Malformed transactions, need to investigate.
            if (payload.length !== 51) {
                continue;
            }

            const buf = Buffer.alloc(51, payload);

            const side = buf.readInt32LE(5);
            const limitPrice = buf.readBigUInt64LE(9);
            const maxCoinQty = buf.readBigUInt64LE(17);
            const _maxNativePcQtyIncludingFees = buf.readBigUInt64LE(25);
            const _selfTradeBehavior = buf.readUInt32LE(33);
            const _orderType = buf.readUInt32LE(37);
            const _clientOrderId = buf.readBigUInt64LE(41);
            const _limit = buf.readUInt16LE(49);

            console.log(`NewOrder: price:${limitPrice}  side:${side}  amount:${maxCoinQty}  blockTime:${transactionResponse.blockTime}`);
        }
    }
}