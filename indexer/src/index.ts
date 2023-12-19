import postgres, { Sql } from "postgres";

const { DATABASE_URL } = process.env;

async function indexAll() {
  const sql = postgres(DATABASE_URL!, {
    prepare: false,
    idle_timeout: 3 * 60,
    max_lifetime: 10 * 60,
    types: {
      bigint: postgres.BigInt,
    },
  });

  // index all SO mints, and reverse mints
  // indexMints()

  const now = new Date().getTime();
  const mints = await sql`SELECT address FROM so.mints WHERE expiration > now`;
  // indexIssues()
  // indexExercises()
  // indexTransfers()
}

async function main() {
  /*
    require("../../../ley.config.js");
    const ley = require("ley");
  
    const successes = await ley.up({ dir: "migrations", driver: "postgres" });
    console.log("applied migrations:", successes);
  
    // run once full sync (last two days)
    await indexAll(2 * 24 * 60 * 60 * 2.5);
    */

  console.log("queueing incremental run every 600s");
  // then run incremental every 10 minute
  setInterval(() => indexAll(), 600 * 1000);
}
main();
