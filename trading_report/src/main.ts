import { Commitment, Connection } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { parseTransaction } from './parseTransaction';
import fetch from 'node-fetch';
import { TradeResponse } from './types';
import { OPENBOOK_BONK_MARKET_ID, OPENBOOK_FORK_ID, OPENBOOK_MNGO_MARKET_ID, STEP_SIZE, TRADING_ACCOUNT } from './constants';

async function main() {
  console.log('Analysis running', new Date().toUTCString());

  const connection = new Connection(
    'https://floral-skilled-borough.solana-mainnet.discover.quiknode.pro/38cf24edefbebeb60eb7516eff40f076ac0823af/',
    'confirmed' as Commitment,
  );
  const market = await Market.load(
    connection,
    OPENBOOK_BONK_MARKET_ID,
    {},
    OPENBOOK_FORK_ID,
  );
  const openOrders = await market.findOpenOrdersAccountsForOwner(connection, TRADING_ACCOUNT);
  const openOrdersAccount = openOrders[0].address;

  let allSigObjs = [];
  let sigObjs = await connection.getSignaturesForAddress(openOrdersAccount);

  const currentTime = (new Date().getTime() / 1_000);
  const cutoffTime = currentTime - 24 * 60 * 60;
  while (true) {
    await new Promise(r => setTimeout(r, 1_000));
    allSigObjs = allSigObjs.concat(sigObjs);
    if (sigObjs[sigObjs.length - 1].blockTime < cutoffTime) {
      break;
    }
    console.log('Fetching more signatures');
    sigObjs = await connection.getSignaturesForAddress(
      openOrdersAccount,
      {before: sigObjs[sigObjs.length - 1].signature}
    );
  }

  // Trim to all signatures in the last 24 hours.
  const signatures = allSigObjs.filter((sigObj) => sigObj.blockTime > cutoffTime).map((sigObj) => sigObj.signature).reverse();
  console.log('There are', signatures.length, 'signatures to process');

  // Sleep on each iter to stay safely below the 25/sec RPC throttling limit.
  for (let i = 0; i < signatures.length / STEP_SIZE; ++i) {
    const transactions = await connection.getTransactions(signatures.slice(STEP_SIZE * i, STEP_SIZE * (i + 1)));
    for (const transaction of transactions) {
      parseTransaction(transaction);
    }
    console.log('Parsed', i * STEP_SIZE, 'transactions');
    await new Promise(r => setTimeout(r, 1_000));
  }

  const url = `https://mango-transaction-log.herokuapp.com/v4/stats/openbook-trades?address=${openOrdersAccount.toBase58()}&address-type=open-orders&limit=10000`
  const response = await fetch(url);
  const trades = await response.json() as TradeResponse[];
  const recentTrades = trades.filter((trade) => Date.parse(trade.block_datetime) / 1_000 > cutoffTime);

  const sells = recentTrades.filter((trade) => trade.side === 'sell');
  const buys = recentTrades.filter((trade) => trade.side === 'buy');

  const totalSellsValue = sells.map((trade) => trade.size * trade.price).reduce(function(a, b) { return a + b; }, 0);
  const totalBuysValue = buys.map((trade) => trade.size * trade.price).reduce(function(a, b) { return a + b; }, 0);

  const totalSellsAmount = sells.map((trade) => trade.size).reduce(function(a, b) { return a + b; }, 0);
  const totalBuysAmount = buys.map((trade) => trade.size).reduce(function(a, b) { return a + b; }, 0);

  console.log(`Sold ${totalSellsAmount} for ${totalSellsValue} avg ${totalSellsValue / (totalSellsAmount + .0000000001)}`);
  console.log(`Bought ${totalBuysAmount} for ${totalBuysValue} avg ${totalBuysValue / (totalBuysAmount + .0000000001)}`);

  console.log('Analysis done', new Date().toUTCString());
}

main();
