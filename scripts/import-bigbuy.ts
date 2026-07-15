import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import pg from "pg";

const BIGBUY_URL = "https://api.bigbuy.eu";
const BIGBUY_TOKEN = process.env.BIGBUY_API_PRODUCTION;
const DIRECT_URL = process.env.DIRECT_URL;
const ISO_CODE = process.env.BIGBUY_ISO_CODE || "en";
const ROOT_CATEGORY_ID = Number(process.env.BIGBUY_ROOT_CATEGORY || 2468);
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const CACHE_DIR = path.join(os.tmpdir(), "bigbuy-cache");

if (!BIGBUY_TOKEN) throw new Error("BIGBUY_API_PRODUCTION missing in .env");
if (!DIRECT_URL) throw new Error("DIRECT_URL missing in .env");

fs.mkdirSync(CACHE_DIR, { recursive: true });

let client: pg.Client;

async function connect() {
  client = new pg.Client({ connectionString: DIRECT_URL, ssl: { rejectUnauthorized: false } });
  client.on("error", () => {});
  await client.connect();
}

async function reconnect() {
  try { await client.end(); } catch {}
  await connect();
}

async function query(sql: string, params?: unknown[]) {
  for (let i = 0; i < 3; i++) {
    try { return await client.query(sql, params); }
    catch (err: any) {
      if (err.message?.includes("terminated") || err.message?.includes("Connection") || err.code === "EPIPE") {
        await reconnect(); continue;
      }
      throw err;
    }
  }
  throw new Error("query failed after retries");
}

async function bbFetch(url: string, cacheFile: string): Promise<unknown> {
  const cachePath = path.join(CACHE_DIR, cacheFile);
  if (fs.existsSync(cachePath)) {
    const stat = fs.statSync(cachePath);
    if (Date.now() - stat.mtimeMs < 6 * 3600 * 1000) {
      console.log(`  cache hit: ${cacheFile} (${(stat.size / 1024 / 1024).toFixed(1)}MB)`);
      return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    }
  }
  console.log(`  fetching ${url}`);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${BIGBUY_TOKEN}` } });
  if (!res.ok) throw new Error(`BigBuy ${url}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  fs.writeFileSync(cachePath, text);
  console.log(`  cached ${cacheFile} (${(text.length / 1024 / 1024).toFixed(1)}MB)`);
  return JSON.parse(text);
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

function cuid(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 12)}`;
}

function stripHtml(html: string, maxLen = 300): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.substring(0, maxLen - 1) + "…" : text;
}

interface BbCategory { id: number; name: string; url: string; parentCategory?: number; urlImages?: string[]; }
interface BbProduct {
  id: number; sku: string; ean13: string | null; weight: number;
  manufacturer: number | null; category: number;
  wholesalePrice: number; retailPrice: number; active: number | boolean;
  dateUpd?: string;
}
interface BbInfo { id: number; sku: string; name: string; description: string | null; url: string; shortDescription: string | null; }
interface BbImages { id: number; images: Array<{ id: number; url: string; name: string; isCover: boolean; position: number; }>; }

async function main() {
  console.log(`\n=== BigBuy → Neon import (root category ${ROOT_CATEGORY_ID}, isoCode=${ISO_CODE}) ===\n`);

  console.log("[1/5] Fetching categories tree...");
  const allCats = await bbFetch(
    `${BIGBUY_URL}/rest/catalog/categories.json?isoCode=${ISO_CODE}`,
    `categories-${ISO_CODE}.json`,
  ) as BbCategory[];

  const catById = new Map(allCats.map((c) => [c.id, c]));
  const children = new Map<number, number[]>();
  for (const c of allCats) {
    if (c.parentCategory != null) {
      if (!children.has(c.parentCategory)) children.set(c.parentCategory, []);
      children.get(c.parentCategory)!.push(c.id);
    }
  }
  const targetCatIds = new Set<number>();
  (function walk(id: number) {
    if (targetCatIds.has(id)) return;
    targetCatIds.add(id);
    for (const c of children.get(id) || []) walk(c);
  })(ROOT_CATEGORY_ID);
  console.log(`  target category tree: ${targetCatIds.size} categories`);

  console.log("[2/5] Fetching all products...");
  const allProducts = await bbFetch(
    `${BIGBUY_URL}/rest/catalog/products.json`,
    "products.json",
  ) as BbProduct[];
  console.log(`  total in BigBuy: ${allProducts.length}`);

  let scoped = allProducts.filter((p) => targetCatIds.has(p.category) && (p.active === 1 || p.active === true));
  console.log(`  in category tree: ${scoped.length}`);
  if (scoped.length > LIMIT) {
    scoped = scoped.slice(0, LIMIT);
    console.log(`  limited to ${LIMIT}`);
  }
  const productIds = new Set(scoped.map((p) => p.id));

  console.log("[3/5] Fetching product info...");
  const allInfo = await bbFetch(
    `${BIGBUY_URL}/rest/catalog/productsinformation.json?isoCode=${ISO_CODE}`,
    `productsinformation-${ISO_CODE}.json`,
  ) as BbInfo[];
  const infoById = new Map<number, BbInfo>();
  for (const info of allInfo) if (productIds.has(info.id)) infoById.set(info.id, info);
  console.log(`  matched info for ${infoById.size}/${productIds.size} products`);

  console.log("[4/5] Fetching product images...");
  const allImages = await bbFetch(
    `${BIGBUY_URL}/rest/catalog/productsimages.json`,
    "productsimages.json",
  ) as BbImages[];
  const imagesById = new Map<number, BbImages["images"]>();
  for (const img of allImages) if (productIds.has(img.id)) imagesById.set(img.id, img.images);
  console.log(`  matched images for ${imagesById.size} products`);

  console.log("[5/5] Writing to Postgres...");
  await connect();

  console.log("  clearing existing data...");
  await query('DELETE FROM "ProductCategory"');
  await query('DELETE FROM "ProductImage"');
  await query('DELETE FROM "Review"');
  await query('DELETE FROM "WishlistItem"');
  await query('DELETE FROM "Product"');
  await query('DELETE FROM "Category"');

  console.log("  inserting categories...");
  const usedCatIds = new Set<number>();
  function addWithAncestors(id: number) {
    if (usedCatIds.has(id)) return;
    usedCatIds.add(id);
    const parent = catById.get(id)?.parentCategory;
    if (parent && targetCatIds.has(parent)) addWithAncestors(parent);
  }
  addWithAncestors(ROOT_CATEGORY_ID);
  for (const p of scoped) addWithAncestors(p.category);

  const catIdToDb = new Map<number, string>();
  const now = new Date().toISOString();
  const orderedCats: number[] = [];
  function addOrdered(id: number) {
    if (orderedCats.includes(id) || !usedCatIds.has(id)) return;
    const parent = catById.get(id)?.parentCategory;
    if (parent && usedCatIds.has(parent)) addOrdered(parent);
    orderedCats.push(id);
  }
  for (const id of usedCatIds) addOrdered(id);

  const slugSeen = new Set<string>();
  function uniqueSlug(base: string): string {
    let s = base || "cat";
    let i = 1;
    while (slugSeen.has(s)) { s = `${base}-${i++}`; }
    slugSeen.add(s);
    return s;
  }
  for (const cid of orderedCats) {
    const c = catById.get(cid);
    if (!c) continue;
    const dbId = cuid();
    const slug = uniqueSlug(slugify(c.url || c.name));
    const imageUrl = c.urlImages?.find((u) => u.includes("_big")) || c.urlImages?.[0] || null;
    const parentDbId = c.parentCategory && usedCatIds.has(c.parentCategory) ? catIdToDb.get(c.parentCategory) : null;
    await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,0,true,$6,$6)`,
      [dbId, c.name, slug, parentDbId, imageUrl, now],
    );
    catIdToDb.set(cid, dbId);
  }
  console.log(`  inserted ${catIdToDb.size} categories`);

  console.log("  inserting products...");
  const prodSlugSeen = new Set<string>();
  function uniqueProdSlug(name: string, sku: string): string {
    let base = slugify(name) || slugify(sku) || "product";
    let s = base, i = 1;
    while (prodSlugSeen.has(s)) s = `${base}-${i++}`;
    prodSlugSeen.add(s);
    return s;
  }

  const rows: unknown[][] = [];
  const skuToDbId = new Map<string, string>();
  const skuToBbId = new Map<string, number>();
  for (const p of scoped) {
    const info = infoById.get(p.id);
    const name = info?.name?.trim() || `BigBuy ${p.sku}`;
    const sku = p.sku;
    if (!sku) continue;
    const price = Number(p.retailPrice) || 0;
    const cost = Number(p.wholesalePrice) || null;
    if (price <= 0) continue;
    const description = info?.description || null;
    const shortDescription = info?.shortDescription || (description ? stripHtml(description, 300) : null);
    const weight = p.weight && p.weight > 0 ? p.weight : null;
    const ean = p.ean13 && /^\d{13}$/.test(p.ean13) ? p.ean13 : null;
    const quantity = p.active === 1 || p.active === true ? 999 : 0;
    const dbId = cuid();
    skuToDbId.set(sku, dbId);
    skuToBbId.set(sku, p.id);
    rows.push([
      dbId, name, uniqueProdSlug(name, sku), sku,
      price, null, cost, quantity, description, shortDescription,
      weight, "ACTIVE", null, ean, null, "new", null, now, now,
    ]);
  }
  console.log(`  prepared ${rows.length} products`);

  const cols = `id, name, slug, sku, price, "comparePrice", "costPrice", quantity, description, "shortDescription", weight, status, gtin, ean, mpn, condition, "metaTitle", "createdAt", "updatedAt"`;
  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    batch.forEach((r, j) => {
      const off = j * 19;
      placeholders.push(`(${Array.from({ length: 19 }, (_, k) => `$${off + k + 1}`).join(",")})`);
      values.push(...r);
    });
    try {
      await query(
        `INSERT INTO "Product" (${cols}) VALUES ${placeholders.join(",")} ON CONFLICT (sku) DO NOTHING`,
        values,
      );
      inserted += batch.length;
    } catch (err) {
      // fallback one-by-one
      for (const r of batch) {
        try {
          await query(
            `INSERT INTO "Product" (${cols}) VALUES (${Array.from({ length: 19 }, (_, k) => `$${k + 1}`).join(",")}) ON CONFLICT (sku) DO NOTHING`,
            r,
          );
          inserted++;
        } catch (e: any) {
          console.error(`  ! failed ${r[3]}: ${e.message}`);
        }
      }
    }
    process.stdout.write(`\r  products: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log(`\n  inserted ${inserted} products`);

  console.log("  linking product↔category...");
  const catLinks: { productDbId: string; categoryDbId: string }[] = [];
  for (const p of scoped) {
    const productDbId = skuToDbId.get(p.sku);
    const categoryDbId = catIdToDb.get(p.category);
    if (productDbId && categoryDbId) catLinks.push({ productDbId, categoryDbId });
  }
  for (let i = 0; i < catLinks.length; i += 500) {
    const batch = catLinks.slice(i, i + 500);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    batch.forEach((l, j) => {
      placeholders.push(`($${j * 2 + 1}, $${j * 2 + 2})`);
      values.push(l.productDbId, l.categoryDbId);
    });
    await query(
      `INSERT INTO "ProductCategory" ("productId", "categoryId") VALUES ${placeholders.join(",")} ON CONFLICT DO NOTHING`,
      values,
    );
    process.stdout.write(`\r  links: ${Math.min(i + 500, catLinks.length)}/${catLinks.length}`);
  }
  console.log();

  console.log("  inserting images...");
  const imageRows: { id: string; url: string; alt: string; sort: number; productDbId: string }[] = [];
  for (const [sku, dbId] of skuToDbId) {
    const bbId = skuToBbId.get(sku);
    if (!bbId) continue;
    const imgs = imagesById.get(bbId);
    if (!imgs?.length) continue;
    const sorted = [...imgs].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.position - b.position);
    for (let idx = 0; idx < Math.min(sorted.length, 8); idx++) {
      const img = sorted[idx];
      imageRows.push({ id: cuid(), url: img.url, alt: img.name || sku, sort: idx, productDbId: dbId });
    }
  }
  for (let i = 0; i < imageRows.length; i += 500) {
    const batch = imageRows.slice(i, i + 500);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    batch.forEach((img, j) => {
      const o = j * 5;
      placeholders.push(`($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5})`);
      values.push(img.id, img.url, img.alt, img.sort, img.productDbId);
    });
    await query(
      `INSERT INTO "ProductImage" (id, url, alt, "sortOrder", "productId") VALUES ${placeholders.join(",")}`,
      values,
    );
    process.stdout.write(`\r  images: ${Math.min(i + 500, imageRows.length)}/${imageRows.length}`);
  }
  console.log();

  const counts = await Promise.all([
    query('SELECT count(*)::int as n FROM "Product"'),
    query('SELECT count(*)::int as n FROM "Category"'),
    query('SELECT count(*)::int as n FROM "ProductImage"'),
    query('SELECT count(*)::int as n FROM "ProductCategory"'),
  ]);
  console.log(`\n=== done ===`);
  console.log(`  Products:          ${counts[0].rows[0].n}`);
  console.log(`  Categories:        ${counts[1].rows[0].n}`);
  console.log(`  Images:            ${counts[2].rows[0].n}`);
  console.log(`  Product→Category:  ${counts[3].rows[0].n}`);

  await client.end();
}

main().catch((err) => {
  console.error("import failed:", err);
  process.exit(1);
});
