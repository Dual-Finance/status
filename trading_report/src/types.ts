
export interface TradeResponse {
    signature: string;
    block_datetime: string;
    market: string;
    open_orders: string;
    bid: boolean;
    maker: boolean;
    referrer_rebate: any;
    order_id: string;
    client_order_id: string;
    fee_tier: number;
    instruction_num: number;
    size: number;
    price: number;
    side: string;
    fee_cost: number;
    open_orders_owner: string;
    base_symbol: string;
    quote_symbol: string;
}