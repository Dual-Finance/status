import * as fs from 'fs';
import { writeFile } from 'node:fs';
import { PublicKey } from '@solana/web3.js';

async function verify() {
  console.log('Verify addresses are valid', new Date().toUTCString());
  const data = parseCSVFromFile("./address.csv");
  let verifiedAddress = [];
  for(const address of data){
    try{
      const pubKey = new PublicKey(address);
      if (PublicKey.isOnCurve(pubKey)) {
        verifiedAddress.push(address);
      }
    } catch (err) {
      console.log('NOT ON CURVE', address);
    }
  }
  const uniqueAddress = [...new Set(verifiedAddress)];
  console.log('Total Verified Addresses', uniqueAddress.length);
  writeFile('verified_addresses.csv', uniqueAddress.join("\n"), (err) => {
    if (err) {
      throw err;
    }
  });
}

function parseCSVFromFile(filePath: string): string[] {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const rows = fileData.trim().split('\n');
  return rows;
}

verify();
