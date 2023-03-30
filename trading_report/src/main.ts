import { appendFile, writeFile } from 'node:fs';
import { Commitment, Connection } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { parseTransaction } from './parseTransaction';
import fetch from 'node-fetch';
import { TradeResponse } from './types';
import { OPENBOOK_FORK_ID, STEP_SIZE, SYMBOL_TO_OPENBOOK_MARKET_ID, TRADING_ACCOUNT } from './constants';
import { getSignatures } from './getSignatures';

async function main() {
  const SYMBOL = process.env.SYMBOL ? process.env.SYMBOL : 'BONK';
  console.log('Analysis running', new Date().toUTCString(), SYMBOL);

  const connection = new Connection(
    process.env.RPC_URL,
    'confirmed' as Commitment,
  );
  const market = await Market.load(
    connection,
    SYMBOL_TO_OPENBOOK_MARKET_ID[SYMBOL],
    {},
    OPENBOOK_FORK_ID,
  );
  const openOrders = await market.findOpenOrdersAccountsForOwner(connection, TRADING_ACCOUNT);

  let signatures = [];
  for (const openOrdersAccount of openOrders) {
    signatures = signatures.concat(await getSignatures(connection, openOrdersAccount.address));
  }
  console.log('There are', signatures.length, 'signatures to process');

  let allLogs: string[] = ['instruction,price,side,qty,time'];
  // Sleep on each iter to stay safely below the 25/sec RPC throttling limit.
  for (let i = 0; i < signatures.length / STEP_SIZE; ++i) {
    const transactions = await connection.getTransactions(signatures.slice(STEP_SIZE * i, STEP_SIZE * (i + 1)));
    try {
      for (const transaction of transactions) {
        allLogs = allLogs.concat(parseTransaction(transaction));
      }
    } catch (err) {
      console.log('Failed. Backing off', err);
      await new Promise(r => setTimeout(r, 10_000));
    }
    console.log('Parsed', i * STEP_SIZE, 'transactions');
    await new Promise(r => setTimeout(r, 1_000));
  }

  writeFile('offers.csv', allLogs.join("\n"), (err) => {
    if (err) {
      throw err;
    }
  });

  const currentTime = (new Date().getTime() / 1_000);
  const cutoffTime = currentTime - 24 * 60 * 60;

  // Assumes that all trades happen on the first open orders account.
  const opbUrl = `https://api.mngo.cloud/data/v4/stats/openbook-trades?address=${openOrders[0].address}&address-type=open-orders&limit=10000`
  const response = await fetch(opbUrl);
  const opbTrades = await response.json() as TradeResponse[];
  const lastPrice = opbTrades[opbTrades.length-1].price;
  const opbRecentTrades = opbTrades.filter((trade) => Date.parse(trade.block_datetime) / 1_000 > cutoffTime);

  const opbSells = opbRecentTrades.filter((trade) => trade.side === 'sell');
  const opbBuys = opbRecentTrades.filter((trade) => trade.side === 'buy');

  const opbTotalSellsValue = opbSells.map((trade) => trade.size * trade.price).reduce(function(a, b) { return a + b; }, 0);
  const opbTotalBuysValue = opbBuys.map((trade) => trade.size * trade.price).reduce(function(a, b) { return a + b; }, 0);

  const opbTotalSellsAmount = opbSells.map((trade) => trade.size).reduce(function(a, b) { return a + b; }, 0);
  const opbTotalBuysAmount = opbBuys.map((trade) => trade.size).reduce(function(a, b) { return a + b; }, 0);
  const opbClosedAmount = Math.min(opbTotalBuysAmount, opbTotalSellsAmount);

  const opbBuyAvgPrice = opbTotalBuysAmount == 0 ? 0 : opbTotalBuysValue / opbTotalBuysAmount;
  const opbSellAvgPrice = opbTotalSellsAmount == 0 ? 0 : opbTotalSellsValue / opbTotalSellsAmount;
  const opbAvgPriceDiff = (opbSellAvgPrice - opbBuyAvgPrice);
  
  const opbRPnL = opbClosedAmount * opbAvgPriceDiff;
  const opbUPnL = (opbTotalBuysAmount > opbTotalSellsAmount) ? (opbTotalBuysAmount - opbClosedAmount) * (lastPrice - opbBuyAvgPrice)
    : (opbTotalSellsAmount - opbClosedAmount) * (opbSellAvgPrice - lastPrice);
  const opbNetPnL = opbRPnL + opbUPnL;

  console.log(`Openbook trades`);
  console.log(`Bought ${opbTotalBuysAmount} for ${opbBuyAvgPrice}, net notional: ${opbTotalBuysValue}`);
  console.log(`Sold ${opbTotalSellsAmount} for ${opbSellAvgPrice}, net notional: ${opbTotalSellsValue}`);

  const jupUrl = `https://stats.jup.ag/transactions?publicKey=${TRADING_ACCOUNT}`
  const jupResponse = await fetch(jupUrl);
  const jupTrades = await jupResponse.json();

  const filteredTrades = jupTrades.filter((trade) => trade.inSymbol === SYMBOL || trade.outSymbol === SYMBOL).filter((trade) =>  Date.parse(trade.timestamp) / 1_000 > cutoffTime);

  const jupSells = filteredTrades.filter((trade) => trade.inSymbol === SYMBOL);
  const jupBuys = filteredTrades.filter((trade) => trade.outSymbol === SYMBOL);

  const jupTotalSellsValue = jupSells.map((trade) => Number(trade.inAmountInUSD)).reduce(function(a, b) { return a + b; }, 0);
  const jupTotalBuysValue = jupBuys.map((trade) => Number(trade.outAmountInUSD)).reduce(function(a, b) { return a + b; }, 0);

  const jupTotalSellsAmount = jupSells.map((trade) => Number(trade.inAmountInDecimal)).reduce(function(a, b) { return a + b; }, 0);
  const jupTotalBuysAmount = jupBuys.map((trade) => Number(trade.outAmountInDecimal)).reduce(function(a, b) { return a + b; }, 0);
  const jupClosedAmount = Math.min(jupTotalBuysAmount, jupTotalSellsAmount);

  const jupBuyAvgPrice = jupTotalBuysAmount == 0 ? 0 : jupTotalBuysValue / jupTotalBuysAmount;
  const jupSellAvgPrice = jupTotalSellsAmount == 0 ? 0 : jupTotalSellsValue / jupTotalSellsAmount;
  const jupAvgPriceDiff = (jupSellAvgPrice - jupBuyAvgPrice);
  
  const jupRPnL = jupClosedAmount * jupAvgPriceDiff;
  const jupUPnL = (jupTotalBuysAmount > jupTotalSellsAmount) ? (jupTotalBuysAmount - jupClosedAmount) * (lastPrice - jupBuyAvgPrice)
    : (jupTotalSellsAmount - jupClosedAmount) * (jupSellAvgPrice - lastPrice);
  const jupNetPnL = jupRPnL + jupUPnL;

  console.log(`Jupiter trades`);
  console.log(`Bought ${jupTotalBuysAmount} for ${jupBuyAvgPrice}, net notional: ${jupTotalBuysValue}`);
  console.log(`Sold ${jupTotalSellsAmount} for ${jupSellAvgPrice}, net notional: ${jupTotalSellsValue}`);

  console.log(`PnL`);
  console.log(`Total PnL ${opbNetPnL + jupNetPnL} Realized PnL ${opbRPnL + jupRPnL} Unrealized PnL ${opbUPnL + jupUPnL} Last Price ${lastPrice}`);

  const transactions: string[] = ["side,price,qty,time"];
  for (const sell of opbSells) {
    transactions.push(`sell,${sell.price},${sell.size},${sell.block_datetime}`);
  }
  for (const buy of opbBuys) {
    transactions.push(`buy,${buy.price},${buy.size},${buy.block_datetime}`);
  }
  for (const sell of jupSells) {
    transactions.push(`sell,${sell.outAmountInDecimal / sell.inAmountInDecimal},${sell.inAmountInDecimal},${sell.timestamp}`);
  }
  for (const buy of jupBuys) {
    transactions.push(`buy,${buy.inAmountInDecimal / buy.outAmountInDecimal},${buy.outAmountInDecimal},${buy.timestamp}`);
  }
  writeFile('transactions.csv', transactions.join("\n"), (err) => {
    if (err) {
      throw err;
    }
  });

  appendFile('trade_log.txt', `${SYMBOL} Trading at ${(new Date()).toISOString()}`, () => {});
  appendFile('trade_log.txt', `
Openbook trades
  Bought ${opbTotalBuysAmount} for ${opbBuyAvgPrice}, net notional: ${opbTotalBuysValue}
  Sold ${opbTotalSellsAmount} for ${opbSellAvgPrice}, net notional: ${opbTotalSellsValue}
`, () => {}
);
  appendFile('trade_log.txt', `
Jupiter trades
  Bought ${jupTotalBuysAmount} for ${jupBuyAvgPrice}, net notional: ${jupTotalBuysValue}
  Sold ${jupTotalSellsAmount} for ${jupSellAvgPrice}, net notional: ${jupTotalSellsValue}
`, () => {}
);
appendFile('trade_log.txt', `
PnL
  Total PnL ${opbNetPnL + jupNetPnL} Realized PnL ${opbRPnL + jupRPnL} Unrealized PnL ${opbUPnL + jupUPnL} Last Price ${lastPrice}
`, () => {}
);
  appendFile('trade_log.txt', `\n`, () => {});

  console.log('Analysis done', new Date().toUTCString());
}

main();
