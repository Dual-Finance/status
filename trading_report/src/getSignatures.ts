import { Connection, PublicKey } from "@solana/web3.js";


export async function getSignatures(connection: Connection, openOrdersAccount: PublicKey): Promise<string[] > {
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
      if (allSigObjs.length > 10_000) {
        break;
      }
      console.log(`Fetching more signatures, already have ${allSigObjs.length}`);
      sigObjs = await connection.getSignaturesForAddress(
        openOrdersAccount,
        {before: sigObjs[sigObjs.length - 1].signature}
      );
    }
  
    // Trim to all signatures in the last 24 hours.
    const signatures = allSigObjs.filter((sigObj) => sigObj.blockTime > cutoffTime).map((sigObj) => sigObj.signature).reverse();
    return signatures;
}