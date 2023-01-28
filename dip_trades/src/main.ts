import { Commitment, Connection } from '@solana/web3.js';
import { parseMmSale, parsePremium, Payment } from './parseTransaction';
import { MM_PREMIUM_ACCOUNT, OPTION_VAULT, PREMIUM_ACCOUNT, STEP_SIZE } from './constants';
import { getSignatures } from './getSignatures';

async function main() {
  console.log('Analysis running', new Date().toUTCString());

  const connection = new Connection(
    process.env.RPC_URL,
    'confirmed' as Commitment,
  );
  let signatures = [];
  signatures = signatures.concat(await getSignatures(connection, PREMIUM_ACCOUNT));

  let payments: Payment[] = [];
  // Sleep on each iter to stay safely below the 25/sec RPC throttling limit.
  for (let i = 0; i < signatures.length / STEP_SIZE; ++i) {
    const transactions = await connection.getTransactions(signatures.slice(STEP_SIZE * i, STEP_SIZE * (i + 1)));
    for (const transaction of transactions) {
      const payment: Payment = parsePremium(transaction);
      payments.push(payment);
    }
    await new Promise(r => setTimeout(r, 1_000));
  }

  console.log('Options bought');
  console.log(payments);

  signatures = await getSignatures(connection, MM_PREMIUM_ACCOUNT);

  payments = [];
  // Sleep on each iter to stay safely below the 25/sec RPC throttling limit.
  for (let i = 0; i < signatures.length / STEP_SIZE; ++i) {
    const transactions = await connection.getTransactions(signatures.slice(STEP_SIZE * i, STEP_SIZE * (i + 1)));
    for (const transaction of transactions) {
      const payment: Payment = parseMmSale(transaction);
      if (payment.amount === 0) {
        continue;
      }
      payments.push(payment);
    }
    await new Promise(r => setTimeout(r, 1_000));
  }

  console.log('Options sold');
  console.log(payments);

  console.log('Analysis done', new Date().toUTCString());
}

main();
