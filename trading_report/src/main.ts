import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { parseTransaction } from './parseTransaction';

async function main() {
  console.log('Analysis running', new Date().toUTCString());

  const connection = new Connection(
    "https://floral-skilled-borough.solana-mainnet.discover.quiknode.pro/38cf24edefbebeb60eb7516eff40f076ac0823af/",
    'confirmed' as Commitment);

  // ckc  open orders account for BONK
  const sigObjs = await connection.getSignaturesForAddress(new PublicKey("361WP3Vtw2H4r3yjrbobZr4qJAGQdsnY5kdMsDdvc61n"), {limit: 20});
  //console.log(sigObjs);
  const signatures = sigObjs.map((sigObj) => sigObj.signature);

  // TODO: Sleep on each iter and build up a list of transactions in the last 24 hours
  /*
  const transactions = await connection.getTransactions(signatures.slice(0, 10));
  for (const transaction of transactions) {
    console.log(transaction.transaction.message.instructions[0].programIdIndex);
  }
  */





  // CreateOrder: programIdIndex = 13
  //const transactions = await connection.getTransactions(["5imVwvUMeibFkUtvCMjdD6KDbkgQdxKE3r892zB45zH8KEYe1Vcoetns3zmndS1mBWAoJ2o6sJdnxapcBtEyVWKZ"]);

  // CancelOrder: programIdIndex = 7
  const transactions = await connection.getTransactions(["JJXphDics5pvUAYCNrsgojtMuaEDVqNXAtQXUiXdpJuQ9kW6xm1k6hMixMJDLE4KpRo8xkx7yHZsMPgM1xUapd8"]);
  parseTransaction(transactions[0].transaction.message);

  // SettleFunds: programIdIndex = 8
  //const transactions = await connection.getTransactions(["wCF9nh8w16pYnvZKe3acTHDJDUPSNdYoZiphMivAnZRa2ZNBpNqJHYezTKKBcpELWkhek5N4QxVVQqR8XAYKTED"]);

  // ConsumeEvents: programIdIndex = 6
  //const transactions = await connection.getTransactions(["3hL2mSRSy7dQtkkAegrqp8Dg7BqDMjWK2nuGVHKyS7MZJ7Lypb8XXeRxx5kaMKPgFAxp5pR5ZXroqy9XGHAzqm3p"]);

  //console.log(transactions[0].meta);
  //console.log(transactions[0].meta.innerInstructions[0].instructions);
}

main();
