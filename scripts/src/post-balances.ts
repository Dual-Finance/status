import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const accounts = {
  HotWallet: "DUALuxbrquKUdTswJhQ2xzT7n3YqKyobL4m3BZfJezoi",
  OptionsVault: "9SgZKdeTMaNuEZnhccK2crHxi1grXRmZKQCvNSKgVrCQ",
  RiskManager: "CkcJx7Uwgxck5zm3DqUp2N1ikkkoPn2wA8zf7oS4tFSZ",
  Realms: "7Z36Efbt7a4nLiV7s5bY7J2e4TJ6V9JEKGccsy2od2bE",
};

// Main function to fetch balances and post to Discord
async function main() {
  const discordWebhookUrl = process.env.DISCORD_GAS_WEBHOOK;
  if (!discordWebhookUrl) {
    return new Error("No webhook set");
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  const balances: Record<string, number> = {};
  for (const [label, publicKeyStr] of Object.entries(accounts)) {
    const publicKey = new PublicKey(publicKeyStr);
    balances[label] = await fetchBalance(connection, publicKey);
  }

  await postToDiscord(discordWebhookUrl, balances);
  console.log("Balances fetched and posted to Discord");
}

// Function to fetch the balance of a Solana account
async function fetchBalance(
  connection: Connection,
  publicKey: PublicKey,
): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
}

// Function to post data to Discord
async function postToDiscord(webhookUrl: string, data: object) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: null,
      embeds: [
        {
          title: "Solana Account Balances",
          description: JSON.stringify(data, null, 2),
          color: 5814783,
        },
      ],
    }),
  });
}


main().catch(console.error);
