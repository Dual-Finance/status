import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { parseTransaction } from './parseTransaction';
import fetch from 'node-fetch';
import { TradeResponse } from './types';
import { STEP_SIZE } from './constants';

async function main() {
  console.log('Analysis running', new Date().toUTCString());

  const connection = new Connection(
    "https://floral-skilled-borough.solana-mainnet.discover.quiknode.pro/38cf24edefbebeb60eb7516eff40f076ac0823af/",
    'confirmed' as Commitment);

  let allSigObjs = [];
  // ckc  open orders account for BONK
  let sigObjs = await connection.getSignaturesForAddress(
    new PublicKey("361WP3Vtw2H4r3yjrbobZr4qJAGQdsnY5kdMsDdvc61n"),
  );

  const currentTime = (new Date().getTime() / 1_000);
  const cutoffTime = currentTime - 24 * 60 * 60;
  while (true) {
    allSigObjs = allSigObjs.concat(sigObjs);
    if (sigObjs[sigObjs.length - 1].blockTime < cutoffTime) {
      break;
    }
    console.log('Fetching more signatures');
    sigObjs = await connection.getSignaturesForAddress(
      new PublicKey("361WP3Vtw2H4r3yjrbobZr4qJAGQdsnY5kdMsDdvc61n"),
      {before: sigObjs[sigObjs.length - 1].signature}
    );
    await new Promise(r => setTimeout(r, 1_000));
  }

  // Trim to all signatures in the last 24 hours.
  const signatures = allSigObjs.filter((sigObj) => sigObj.blockTime > cutoffTime).map((sigObj) => sigObj.signature);
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

  // CreateOrder: programIdIndex = 13
  // const transactions = await connection.getTransactions(["5imVwvUMeibFkUtvCMjdD6KDbkgQdxKE3r892zB45zH8KEYe1Vcoetns3zmndS1mBWAoJ2o6sJdnxapcBtEyVWKZ"]);

  // CancelOrder: programIdIndex = 7
  // const transactions = await connection.getTransactions(["JJXphDics5pvUAYCNrsgojtMuaEDVqNXAtQXUiXdpJuQ9kW6xm1k6hMixMJDLE4KpRo8xkx7yHZsMPgM1xUapd8"]);

  const url = 'https://mango-transaction-log.herokuapp.com/v4/stats/openbook-trades?address=361WP3Vtw2H4r3yjrbobZr4qJAGQdsnY5kdMsDdvc61n&address-type=open-orders&limit=10000'
  const response = await fetch(url);
  const trades = await response.json() as TradeResponse[];
  const recentTrades = trades.filter((trade) => Date.parse(trade.block_datetime) / 1_000 > cutoffTime);
  console.log(recentTrades);
  console.log(recentTrades.length);
}

main();
