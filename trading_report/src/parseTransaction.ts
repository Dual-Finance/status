import { Message } from "@solana/web3.js";
import { u128 } from "@project-serum/borsh";
const bs58 = require('bs58')

// Parse the transaction and return a list of events
export async function parseTransaction(message: Message) {

    for (const instruction of message.instructions) {
        if (instruction.programIdIndex == 7) {
            const payload = bs58.decode(instruction.data);

            const buf = Buffer.alloc(25, payload);

            const limitPrice = buf.readBigUInt64LE(17);

            // Use the way that order ids are generated to determine the order that was cancelled.
            // https://github.com/openbook-dex/program/blob/b6a5cf11c87b3ae4021cde5e2c0ff83d64814902/dex/src/state.rs#L908
            console.log(limitPrice);
        }

        if (instruction.programIdIndex == 13) {
            const payload = bs58.decode(instruction.data);

            const buf = Buffer.alloc(51, payload);

            const side = buf.readInt32LE(5);
            const limit_price = buf.readBigUInt64LE(9);
            const max_coin_qty = buf.readBigUInt64LE(17);
            const _max_native_pc_qty_including_fees = buf.readBigUInt64LE(25);
            const _self_trade_behavior = buf.readUInt32LE(33);
            const _order_type = buf.readUInt32LE(37);
            const client_order_id = buf.readBigUInt64LE(41);
            const _limit = buf.readUInt16LE(49);

            //console.log(side, limit_price, max_coin_qty);
            //console.log(client_order_id);
            console.log(instruction);
        }
    }
}