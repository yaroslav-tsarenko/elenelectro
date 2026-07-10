import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set in .env");

const priceUpdates: [string, number][] = [
  ["773651", 2.5],
  ["068731", 4.0],
  ["068651", 4.5],
  ["068653", 8.5],
  ["572505", 5.5],
  ["068721", 12.0],
  ["775805", 6.5],
  ["067345", 18.0],
  ["752394", 45.0],
  ["BT363911", 350.0],
  ["BTLN4743/230T", 8.5],
  ["752354", 42.0],
  ["752350", 55.0],
  ["752396", 89.0],
  ["752389", 32.0],
  ["752387", 35.0],
  ["004181108", 3.5],
  ["782433", 7.5],
  ["HTS-200", 1.6],
  ["HTS-400", 2.2],
  ["002421445", 9.5],
  ["10", 3.5],
];

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("Updating zero-price products...\n");

  let updated = 0;
  let notFound = 0;

  for (const [sku, price] of priceUpdates) {
    const result = await client.query(
      `UPDATE "Product" SET price = $1, "updatedAt" = NOW() WHERE sku = $2 AND price = 0 RETURNING name, sku`,
      [price, sku],
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`  ✓ ${result.rows[0].name} (${sku}) → €${price}`);
      updated++;
    } else {
      const exists = await client.query(
        `SELECT name, price FROM "Product" WHERE sku = $1`,
        [sku],
      );
      if (exists.rows.length > 0) {
        console.log(`  - ${exists.rows[0].name} (${sku}) already has price €${exists.rows[0].price}, skipped`);
      } else {
        console.log(`  ✗ SKU ${sku} not found in database`);
        notFound++;
      }
    }
  }

  const zeroRemaining = await client.query(
    `SELECT count(*) FROM "Product" WHERE price = 0`,
  );

  console.log(`\nDone! Updated: ${updated}, Not found: ${notFound}`);
  console.log(`Products still with price=0: ${zeroRemaining.rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
