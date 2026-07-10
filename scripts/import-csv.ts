import "dotenv/config";
import fs from "fs";
import path from "path";
import { parse } from "papaparse";
import pg from "pg";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set in .env");

let client: pg.Client;

async function connect() {
  client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  client.on("error", () => {});
  await client.connect();
}

async function reconnect() {
  try { await client.end(); } catch {}
  await connect();
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

function cuid(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `c${ts}${rand}`;
}

function parseCharacteristics(raw: string | undefined): string | null {
  if (!raw) return null;
  const result: Record<string, Record<string, string>> = {};
  for (const pair of raw.split("|")) {
    const groupSep = pair.indexOf(">>");
    if (groupSep !== -1) {
      const group = pair.substring(0, groupSep).trim();
      const rest = pair.substring(groupSep + 2);
      const colonIdx = rest.indexOf(":");
      if (colonIdx !== -1) {
        if (!result[group]) result[group] = {};
        result[group][rest.substring(0, colonIdx).trim()] = rest.substring(colonIdx + 1).trim();
      }
    } else {
      const colonIdx = pair.indexOf(":");
      if (colonIdx !== -1) {
        if (!result["General"]) result["General"] = {};
        result["General"][pair.substring(0, colonIdx).trim()] = pair.substring(colonIdx + 1).trim();
      }
    }
  }
  return Object.keys(result).length > 0 ? JSON.stringify(result) : null;
}

async function query(sql: string, params?: unknown[]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await client.query(sql, params);
    } catch (err: any) {
      if (err.message?.includes("terminated") || err.message?.includes("Connection") || err.code === "EPIPE") {
        console.log(`\n  Reconnecting (attempt ${attempt + 1})...`);
        await reconnect();
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after 3 retries");
}

async function main() {
  const csvPath = path.resolve(__dirname, "../data/products-import.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const { data: rows } = parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  console.log(`Parsed ${rows.length} rows from CSV`);

  await connect();

  // Phase 1: Clean up
  console.log("Deleting existing data...");
  await query('DELETE FROM "ProductCategory"');
  await query('DELETE FROM "ProductImage"');
  await query('DELETE FROM "Review"');
  await query('DELETE FROM "WishlistItem"');
  await query('DELETE FROM "Product"');
  await query('DELETE FROM "Category"');
  console.log("Done");

  // Phase 2: Build categories
  console.log("Creating categories...");
  const categoryMap = new Map<string, { name: string; slug: string; parentSlug?: string }>();

  for (const row of rows) {
    const cat = row.category?.trim();
    if (!cat) continue;
    const catSlug = slugify(cat);
    if (!categoryMap.has(catSlug)) categoryMap.set(catSlug, { name: cat, slug: catSlug });

    const sub = row.subCategory?.trim();
    if (!sub) continue;
    const subSlug = slugify(`${cat}-${sub}`);
    if (!categoryMap.has(subSlug)) categoryMap.set(subSlug, { name: sub, slug: subSlug, parentSlug: catSlug });

    const subSub = row.subSubCategory?.trim();
    if (!subSub) continue;
    const subSubSlug = slugify(`${cat}-${sub}-${subSub}`);
    if (!categoryMap.has(subSubSlug)) categoryMap.set(subSubSlug, { name: subSub, slug: subSubSlug, parentSlug: subSlug });
  }

  // Sort into levels
  const levels: { name: string; slug: string; parentSlug?: string }[][] = [[], [], []];
  for (const entry of categoryMap.values()) {
    if (!entry.parentSlug) levels[0].push(entry);
    else {
      const parent = categoryMap.get(entry.parentSlug);
      if (parent && !parent.parentSlug) levels[1].push(entry);
      else levels[2].push(entry);
    }
  }

  const slugToId = new Map<string, string>();
  const now = new Date().toISOString();

  for (const level of levels) {
    for (const entry of level) {
      const id = cuid();
      const parentId = entry.parentSlug ? slugToId.get(entry.parentSlug) || null : null;
      await query(
        `INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 0, true, $5, $5)
         ON CONFLICT (slug) DO UPDATE SET name = $2, "parentId" = $4
         RETURNING id`,
        [id, entry.name, entry.slug, parentId, now],
      ).then((r) => slugToId.set(entry.slug, r.rows[0].id));
    }
  }
  console.log(`Created ${slugToId.size} categories`);

  // Phase 3: Prepare products
  console.log("Inserting products...");
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();

  function uniqueSlug(name: string, sku: string): string {
    let base = slugify(name);
    if (!base) base = slugify(sku) || "product";
    let slug = base;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    return slug;
  }

  interface PreparedProduct {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    quantity: number;
    description: string | null;
    shortDescription: string | null;
    brand: string | null;
    weight: number | null;
    status: string;
    gtin: string | null;
    ean: string | null;
    mpn: string | null;
    googleCategory: string | null;
    condition: string;
    characteristics: string | null;
    categorySlug?: string;
    imageUrl?: string;
  }

  const products: PreparedProduct[] = [];

  for (const row of rows) {
    const name = row.name?.trim();
    const sku = row.sku?.trim();
    const priceStr = row.price?.trim();
    if (!name || !sku || !priceStr) continue;
    const price = parseFloat(priceStr);
    if (isNaN(price)) continue;
    if (usedSkus.has(sku)) continue;
    usedSkus.add(sku);

    const comparePrice = row.comparePrice ? parseFloat(row.comparePrice) : null;
    const quantity = row.quantity ? parseInt(row.quantity, 10) : 0;
    const weight = row.weight ? parseFloat(row.weight) : null;
    const ean = row.ean && /^\d{13}$/.test(row.ean) ? row.ean : null;

    let categorySlug: string | undefined;
    if (row.category?.trim()) {
      const cat = row.category.trim();
      const sub = row.subCategory?.trim();
      const subSub = row.subSubCategory?.trim();
      if (subSub && sub) categorySlug = slugify(`${cat}-${sub}-${subSub}`);
      else if (sub) categorySlug = slugify(`${cat}-${sub}`);
      else categorySlug = slugify(cat);
    }

    products.push({
      id: cuid(),
      name,
      slug: uniqueSlug(name, sku),
      sku,
      price,
      comparePrice: comparePrice && !isNaN(comparePrice) ? comparePrice : null,
      quantity: isNaN(quantity) ? 0 : quantity,
      description: row.description || null,
      shortDescription: row.shortDescription || null,
      brand: row.brand || null,
      weight: weight && !isNaN(weight) ? weight : null,
      status: row.status || "ACTIVE",
      gtin: row.gtin || null,
      ean,
      mpn: row.mpn || null,
      googleCategory: row.googleCategory || null,
      condition: row.condition || "new",
      characteristics: parseCharacteristics(row.characteristics),
      categorySlug,
      imageUrl: row.imageUrl?.trim(),
    });
  }

  console.log(`Prepared ${products.length} products`);

  // Batch insert products
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const values: unknown[] = [];
    const placeholders: string[] = [];

    for (let j = 0; j < batch.length; j++) {
      const p = batch[j];
      const offset = j * 18;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17}, $${offset + 18})`,
      );
      values.push(
        p.id, p.name, p.slug, p.sku, p.price, p.comparePrice,
        p.quantity, p.description, p.shortDescription, p.brand,
        p.weight, p.status, p.gtin, p.ean, p.mpn, p.condition,
        p.characteristics, now,
      );
    }

    try {
      await query(
        `INSERT INTO "Product" (id, name, slug, sku, price, "comparePrice", quantity, description, "shortDescription", brand, weight, status, gtin, ean, mpn, condition, characteristics, "createdAt", "updatedAt")
         VALUES ${placeholders.map((p) => p.replace(/\)$/, `, $${values.length + 1})`))}
         ON CONFLICT (sku) DO NOTHING`.replace(
          new RegExp(`\\$${values.length + 1}`, "g"),
          `'${now}'`,
        ),
        values,
      );
      inserted += batch.length;
    } catch (err) {
      // Something wrong with the batch SQL template, fall back to one-by-one
      for (const p of batch) {
        try {
          await query(
            `INSERT INTO "Product" (id, name, slug, sku, price, "comparePrice", quantity, description, "shortDescription", brand, weight, status, gtin, ean, mpn, condition, characteristics, "createdAt", "updatedAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18)
             ON CONFLICT (sku) DO NOTHING`,
            [p.id, p.name, p.slug, p.sku, p.price, p.comparePrice, p.quantity, p.description, p.shortDescription, p.brand, p.weight, p.status, p.gtin, p.ean, p.mpn, p.condition, p.characteristics, now],
          );
          inserted++;
        } catch (e2) {
          console.error(`Failed ${p.sku}: ${e2 instanceof Error ? e2.message : e2}`);
        }
      }
    }

    process.stdout.write(`\r  Products: ${Math.min(i + BATCH, products.length)}/${products.length}`);
  }
  console.log(`\n  Inserted: ${inserted}`);

  // Phase 4: Fetch product IDs by SKU
  console.log("Linking categories and images...");
  const allProducts = await query('SELECT id, sku FROM "Product"');
  const skuToId = new Map(allProducts.rows.map((r: { id: string; sku: string }) => [r.sku, r.id]));

  // Category links - batch insert
  const catLinks: { productId: string; categoryId: string }[] = [];
  for (const p of products) {
    if (!p.categorySlug) continue;
    const productId = skuToId.get(p.sku);
    const categoryId = slugToId.get(p.categorySlug);
    if (productId && categoryId) catLinks.push({ productId, categoryId });
  }

  for (let i = 0; i < catLinks.length; i += 200) {
    const batch = catLinks.slice(i, i + 200);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    batch.forEach((l, j) => {
      placeholders.push(`($${j * 2 + 1}, $${j * 2 + 2})`);
      values.push(l.productId, l.categoryId);
    });
    await query(
      `INSERT INTO "ProductCategory" ("productId", "categoryId") VALUES ${placeholders.join(",")} ON CONFLICT DO NOTHING`,
      values,
    );
    process.stdout.write(`\r  Category links: ${Math.min(i + 200, catLinks.length)}/${catLinks.length}`);
  }
  console.log();

  // Images - batch insert
  const images: { id: string; url: string; alt: string; productId: string }[] = [];
  for (const p of products) {
    if (!p.imageUrl) continue;
    const productId = skuToId.get(p.sku);
    if (productId) images.push({ id: cuid(), url: p.imageUrl, alt: p.name, productId });
  }

  for (let i = 0; i < images.length; i += 200) {
    const batch = images.slice(i, i + 200);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    batch.forEach((img, j) => {
      placeholders.push(`($${j * 4 + 1}, $${j * 4 + 2}, $${j * 4 + 3}, 0, $${j * 4 + 4})`);
      values.push(img.id, img.url, img.alt, img.productId);
    });
    await query(
      `INSERT INTO "ProductImage" (id, url, alt, "sortOrder", "productId") VALUES ${placeholders.join(",")} ON CONFLICT DO NOTHING`,
      values,
    );
    process.stdout.write(`\r  Images: ${Math.min(i + 200, images.length)}/${images.length}`);
  }
  console.log();

  // Summary
  const counts = await Promise.all([
    query('SELECT count(*) FROM "Product"'),
    query('SELECT count(*) FROM "Category"'),
    query('SELECT count(*) FROM "ProductImage"'),
    query('SELECT count(*) FROM "ProductCategory"'),
  ]);

  console.log(`\nImport complete!`);
  console.log(`  Products: ${counts[0].rows[0].count}`);
  console.log(`  Categories: ${counts[1].rows[0].count}`);
  console.log(`  Images: ${counts[2].rows[0].count}`);
  console.log(`  Category links: ${counts[3].rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
