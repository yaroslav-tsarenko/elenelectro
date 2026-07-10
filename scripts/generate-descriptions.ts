import "dotenv/config";
import pg from "pg";
import OpenAI from "openai";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let client: pg.Client;

async function connect() {
  client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  client.on("error", () => {});
  await client.connect();
}

async function reconnect() {
  try { await client.end(); } catch {}
  await connect();
}

async function query(sql: string, params?: unknown[]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await client.query(sql, params);
    } catch (err: any) {
      if (err.message?.includes("terminated") || err.message?.includes("Connection") || err.code === "EPIPE") {
        console.log(`  Reconnecting (attempt ${attempt + 1})...`);
        await reconnect();
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after 3 retries");
}

interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string | null;
  category_name: string | null;
  price: number;
  ean: string | null;
  condition: string;
  weight: number | null;
}

interface GeneratedData {
  sku: string;
  description: string;
  shortDescription: string;
  characteristics: Record<string, Record<string, string>>;
}

const SYSTEM_PROMPT = `You are a product data specialist for an electrical materials e-commerce store (AvontShop) based in Europe.

Your task: generate accurate, realistic product descriptions and technical characteristics for electrical products.

RULES:
1. Descriptions must be professional, informative, and SEO-friendly
2. Characteristics MUST be realistic and match what the product actually is based on its name, brand, category, and EAN code
3. Extract technical specs from the product name (voltage, amperage, IP rating, poles, color, etc.)
4. Use metric units (mm, kg, °C) and European electrical standards (CE, IEC, EN)
5. Description: 2-3 sentences about the product, its use case, and key features
6. Short description: 1 concise sentence
7. Characteristics must be grouped into categories like "Electrical", "Physical", "Compliance", "General"
8. Do NOT invent specs that cannot be derived from the product name/category — only include what's reasonable
9. All text in English

Return ONLY valid JSON array, no markdown, no explanation.`;

function buildUserPrompt(products: Product[]): string {
  const items = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    category: p.category_name,
    price: p.price,
    ean: p.ean,
    condition: p.condition,
    weight: p.weight,
  }));

  return `Generate description, shortDescription, and characteristics for these ${products.length} electrical products.

Products:
${JSON.stringify(items, null, 2)}

Return JSON array:
[
  {
    "sku": "...",
    "description": "2-3 sentence product description",
    "shortDescription": "1 sentence summary",
    "characteristics": {
      "Electrical": { "Rated Voltage": "400V", "Rated Current": "32A", ... },
      "Physical": { "Weight": "0.23 kg", "Color": "Red", ... },
      "Compliance": { "IP Rating": "IP44", "Standard": "IEC 60309", ... },
      "General": { "Brand": "ABL", "Condition": "New", ... }
    }
  },
  ...
]`;
}

async function generateBatch(products: Product[]): Promise<GeneratedData[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(products) },
    ],
    temperature: 0.3,
    max_tokens: 16000,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");

  const cleaned = content.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}

async function main() {
  await connect();

  // Get products without descriptions
  const result = await query(`
    SELECT p.id, p.name, p.sku, p.brand, p.price, p.ean, p.condition, p.weight,
           (SELECT c.name FROM "Category" c
            JOIN "ProductCategory" pc ON pc."categoryId" = c.id
            WHERE pc."productId" = p.id LIMIT 1) as category_name
    FROM "Product" p
    WHERE p.description IS NULL OR p.description = ''
    ORDER BY p."createdAt" ASC
  `);

  const products: Product[] = result.rows;
  console.log(`Found ${products.length} products without descriptions\n`);

  if (products.length === 0) {
    console.log("All products already have descriptions!");
    await client.end();
    return;
  }

  const BATCH_SIZE = 15;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    process.stdout.write(`\rBatch ${batchNum}/${totalBatches} (${updated} updated, ${failed} failed)`);

    try {
      const generated = await generateBatch(batch);

      for (const item of generated) {
        const product = batch.find((p) => p.sku === item.sku);
        if (!product) continue;

        try {
          await query(
            `UPDATE "Product"
             SET description = $1,
                 "shortDescription" = $2,
                 characteristics = $3,
                 "updatedAt" = NOW()
             WHERE id = $4`,
            [
              item.description,
              item.shortDescription,
              JSON.stringify(item.characteristics),
              product.id,
            ]
          );
          updated++;
        } catch (err) {
          console.error(`\n  DB update failed for ${item.sku}:`, err instanceof Error ? err.message : err);
          failed++;
        }
      }
    } catch (err) {
      console.error(`\n  Batch ${batchNum} failed:`, err instanceof Error ? err.message : err);
      failed += batch.length;

      // If rate limited, wait and retry
      if (err instanceof Error && err.message.includes("429")) {
        console.log("  Rate limited, waiting 30s...");
        await new Promise((r) => setTimeout(r, 30000));
        i -= BATCH_SIZE; // retry this batch
        failed -= batch.length;
      }
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < products.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${products.length}`);

  await client.end();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
