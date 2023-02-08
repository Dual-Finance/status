import { writeFile } from 'node:fs';
import { Commitment, Connection } from '@solana/web3.js';
import { DIP_PROGRAM_ID, SO_PROGRAM_ID, STEP_SIZE } from './constants';
import { getSignatures } from './getSignatures';

// Change targetProgram, file name & cutoff time to run for other programs
async function airdrop() {
  const targetProgram = SO_PROGRAM_ID;
  console.log('Record Unique Signers', new Date().toUTCString());

  const connection = new Connection(
    process.env.RPC_URL,
    'confirmed' as Commitment,
  );

  let signatures = [];
  signatures = signatures.concat(await getSignatures(connection, targetProgram));
  console.log('There are', signatures.length, 'signatures to process');

  let allAccounts = [];
  let allSignatures = [];
  // Sleep on each iter to stay safely below the 25/sec RPC throttling limit.
  for (let i = 0; i < signatures.length / STEP_SIZE; ++i) {
    const transactions = await connection.getTransactions(signatures.slice(STEP_SIZE * i, STEP_SIZE * (i + 1)));
    try {
      for (const transaction of transactions) {
        // Only count successful txs
        if (transaction.meta.err === null) {
          const signer = transaction.transaction.message.accountKeys[0].toBase58()
          const signature = transaction.transaction.signatures.toString();
          allAccounts.push(signer);
          allSignatures.push(signature);
        }
      }
    } catch (err) {
      console.log('Failed. Backing off', err);
      await new Promise(r => setTimeout(r, 10_000));
    }
    console.log('Parsed', i * STEP_SIZE, 'transactions');
    await new Promise(r => setTimeout(r, 1_000));
  }
  const uniqueSigners = [...new Set(allAccounts)];
  console.log('Total Unique Signers', uniqueSigners.length);
  // Change File per product
  writeFile('so_signers.csv', uniqueSigners.join("\n"), (err) => {
    if (err) {
      throw err;
    }
  });
  console.log('Analysis done', new Date().toUTCString());
}

airdrop();
