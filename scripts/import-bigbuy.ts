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
const PRIMARY_MIN = Number(process.env.PRIMARY_MIN || 40);   // top-level category threshold
const SUB_MIN = Number(process.env.SUB_MIN || 25);           // subcategory threshold
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

interface BbCategory { id: number; name: string; url: string; parentCategory?: number; }
interface BbTaxonomy { id: number; name: string; url: string; parentTaxonomy?: number; urlImages?: string; }
interface BbManufacturer { id: number; name: string; }
interface BbProduct {
  id: number; sku: string; ean13: string | null; weight: number;
  manufacturer: number | null; category: number; taxonomy: number | null;
  wholesalePrice: number; retailPrice: number; active: number | boolean;
}
interface BbInfo { id: number; sku: string; name: string; description: string | null; url: string; shortDescription: string | null; }
interface BbImages { id: number; images: Array<{ id: number; url: string; name: string; isCover: boolean; position: number; }>; }

async function main() {
  console.log(`\n=== BigBuy → Neon import (root category ${ROOT_CATEGORY_ID}, isoCode=${ISO_CODE}) ===\n`);

  console.log("[1/6] Fetching categories tree...");
  const allCats = await bbFetch(
    `${BIGBUY_URL}/rest/catalog/categories.json?isoCode=${ISO_CODE}`,
    `categories-${ISO_CODE}.json`,
  ) as BbCategory[];
  const catChildren = new Map<number, number[]>();
  for (const c of allCats) {
    if (c.parentCategory != null) {
      if (!catChildren.has(c.parentCategory)) catChildren.set(c.parentCategory, []);
      catChildren.get(c.parentCategory)!.push(c.id);
    }
  }
  const targetCatIds = new Set<number>();
  (function walk(id: number) {
    if (targetCatIds.has(id)) return;
    targetCatIds.add(id);
    for (const c of catChildren.get(id) || []) walk(c);
  })(ROOT_CATEGORY_ID);
  console.log(`  target BigBuy categories: ${targetCatIds.size}`);

  console.log("[2/6] Fetching all products...");
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

  console.log("[3/6] Fetching taxonomies, manufacturers, info, images...");
  const [allTax, allMfg, allInfo, allImages] = await Promise.all([
    bbFetch(`${BIGBUY_URL}/rest/catalog/taxonomies.json?isoCode=${ISO_CODE}`, `taxonomies-${ISO_CODE}.json`),
    bbFetch(`${BIGBUY_URL}/rest/catalog/manufacturers.json?isoCode=${ISO_CODE}`, `manufacturers-${ISO_CODE}.json`),
    bbFetch(`${BIGBUY_URL}/rest/catalog/productsinformation.json?isoCode=${ISO_CODE}`, `productsinformation-${ISO_CODE}.json`),
    bbFetch(`${BIGBUY_URL}/rest/catalog/productsimages.json`, "productsimages.json"),
  ]) as [BbTaxonomy[], BbManufacturer[], BbInfo[], BbImages[]];

  const taxById = new Map(allTax.map((t) => [t.id, t]));
  const mfgById = new Map(allMfg.map((m) => [m.id, m.name]));

  const infoById = new Map<number, BbInfo>();
  for (const info of allInfo) if (productIds.has(info.id)) infoById.set(info.id, info);
  console.log(`  info: ${infoById.size}/${productIds.size}`);

  const imagesById = new Map<number, BbImages["images"]>();
  for (const img of allImages) if (productIds.has(img.id)) imagesById.set(img.id, img.images);
  console.log(`  images: ${imagesById.size}`);

  // Build ancestor chain for a taxonomy (leaf → root)
  function ancestors(tid: number): number[] {
    const out: number[] = [];
    const seen = new Set<number>();
    let cur: number | undefined = tid;
    while (cur && taxById.has(cur) && !seen.has(cur)) {
      seen.add(cur);
      out.push(cur);
      const parent: number | undefined = taxById.get(cur)!.parentTaxonomy;
      cur = parent && parent > 0 ? parent : undefined;
    }
    return out;
  }
  function isRootTax(tid: number): boolean {
    const t = taxById.get(tid);
    return !t || !t.parentTaxonomy || t.parentTaxonomy === 0;
  }

  console.log("[4/6] Building category tree from taxonomy...");
  // Count products per taxonomy across the whole ancestor chain
  const taxCount = new Map<number, number>();
  for (const p of scoped) {
    if (!p.taxonomy) continue;
    for (const a of ancestors(p.taxonomy)) {
      taxCount.set(a, (taxCount.get(a) || 0) + 1);
    }
  }

  // Primary: taxonomies whose parent is a root and count >= PRIMARY_MIN
  const primary = new Set<number>();
  for (const [tid, cnt] of taxCount) {
    if (cnt < PRIMARY_MIN) continue;
    const t = taxById.get(tid);
    if (!t) continue;
    if (t.parentTaxonomy && isRootTax(t.parentTaxonomy)) primary.add(tid);
  }

  // Sub: taxonomies whose parent is a primary and count >= SUB_MIN
  const sub = new Set<number>();
  for (const [tid, cnt] of taxCount) {
    if (cnt < SUB_MIN) continue;
    const t = taxById.get(tid);
    if (!t?.parentTaxonomy) continue;
    if (primary.has(t.parentTaxonomy)) sub.add(tid);
  }

  console.log(`  primary categories: ${primary.size}, subcategories: ${sub.size}`);

  // For each scoped product, resolve its (primaryId, subId) by walking ancestors
  const productAssign = new Map<number, { primary?: number; sub?: number }>();
  for (const p of scoped) {
    const chain = p.taxonomy ? ancestors(p.taxonomy) : [];
    const assign: { primary?: number; sub?: number } = {};
    for (const tid of chain) {
      if (!assign.sub && sub.has(tid)) assign.sub = tid;
      if (!assign.primary && primary.has(tid)) { assign.primary = tid; break; }
    }
    productAssign.set(p.id, assign);
  }

  // Count how many products end up with at least a primary
  const withPrimary = [...productAssign.values()].filter((a) => a.primary).length;
  console.log(`  products mapped to a primary: ${withPrimary}/${scoped.length}`);

  console.log("[5/6] Writing categories to Postgres...");
  await connect();
  console.log("  clearing existing data...");
  await query('DELETE FROM "ProductCategory"');
  await query('DELETE FROM "ProductImage"');
  await query('DELETE FROM "Review"');
  await query('DELETE FROM "WishlistItem"');
  await query('DELETE FROM "Product"');
  await query('DELETE FROM "Category"');

  const now = new Date().toISOString();
  const taxToDb = new Map<number, string>();
  const slugSeen = new Set<string>();
  function uniqueSlug(base: string): string {
    let s = base || "cat";
    let i = 1;
    while (slugSeen.has(s)) s = `${base}-${i++}`;
    slugSeen.add(s);
    return s;
  }

  // Insert primary categories first (sorted by product count desc for pretty sortOrder)
  const primarySorted = [...primary].sort((a, b) => (taxCount.get(b) || 0) - (taxCount.get(a) || 0));
  let sortOrder = 0;
  for (const tid of primarySorted) {
    const t = taxById.get(tid)!;
    const dbId = cuid();
    const slug = uniqueSlug(slugify(t.name));
    await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,NULL,$4,$5,true,$6,$6)`,
      [dbId, t.name.trim(), slug, t.urlImages || null, sortOrder++, now],
    );
    taxToDb.set(tid, dbId);
  }
  console.log(`  inserted ${primary.size} primary categories`);

  // Insert subcategories under their primary parent
  for (const tid of sub) {
    const t = taxById.get(tid)!;
    const parentDbId = taxToDb.get(t.parentTaxonomy!);
    if (!parentDbId) continue;
    const dbId = cuid();
    const slug = uniqueSlug(slugify(t.name));
    await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,0,true,$6,$6)`,
      [dbId, t.name.trim(), slug, parentDbId, t.urlImages || null, now],
    );
    taxToDb.set(tid, dbId);
  }
  console.log(`  inserted ${sub.size} subcategories`);

  console.log("[6/6] Writing products + links + images...");
  const prodSlugSeen = new Set<string>();
  function uniqueProdSlug(name: string, sku: string): string {
    const base = slugify(name) || slugify(sku) || "product";
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
    const brand = p.manufacturer ? mfgById.get(p.manufacturer) || null : null;
    const dbId = cuid();
    skuToDbId.set(sku, dbId);
    skuToBbId.set(sku, p.id);
    rows.push([
      dbId, name, uniqueProdSlug(name, sku), sku,
      price, null, cost, quantity, description, shortDescription,
      brand, weight, "ACTIVE", null, ean, null, "new", now, now,
    ]);
  }
  console.log(`  prepared ${rows.length} products`);

  const cols = `id, name, slug, sku, price, "comparePrice", "costPrice", quantity, description, "shortDescription", brand, weight, status, gtin, ean, mpn, condition, "createdAt", "updatedAt"`;
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
    } catch {
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

  console.log("  linking products ↔ categories (primary + sub)...");
  const catLinks: { productDbId: string; categoryDbId: string }[] = [];
  const seenLink = new Set<string>();
  for (const p of scoped) {
    const productDbId = skuToDbId.get(p.sku);
    if (!productDbId) continue;
    const assign = productAssign.get(p.id) || {};
    for (const tid of [assign.primary, assign.sub]) {
      if (!tid) continue;
      const categoryDbId = taxToDb.get(tid);
      if (!categoryDbId) continue;
      const key = `${productDbId}|${categoryDbId}`;
      if (seenLink.has(key)) continue;
      seenLink.add(key);
      catLinks.push({ productDbId, categoryDbId });
    }
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
    query('SELECT count(*)::int as n FROM "Category" WHERE "parentId" IS NULL'),
    query('SELECT count(*)::int as n FROM "ProductImage"'),
    query('SELECT count(*)::int as n FROM "ProductCategory"'),
  ]);
  console.log(`\n=== done ===`);
  console.log(`  Products:          ${counts[0].rows[0].n}`);
  console.log(`  Categories total:  ${counts[1].rows[0].n} (top-level: ${counts[2].rows[0].n})`);
  console.log(`  Images:            ${counts[3].rows[0].n}`);
  console.log(`  Product↔Category:  ${counts[4].rows[0].n}`);

  await client.end();
}

main().catch((err) => {
  console.error("import failed:", err);
  process.exit(1);
});
