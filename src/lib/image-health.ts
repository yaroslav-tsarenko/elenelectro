import { prisma } from "@/lib/prisma";

// Supplier CDNs drop images when a product leaves their catalogue. This check finds
// those products and keeps the storefront clean: dead images are removed, a product
// with no live image left is archived, and a product archived here comes back as soon
// as one of its images answers again. Products archived by hand are never touched.

export type ImageState = "live" | "dead" | "unknown";

export interface ImageHealthOptions {
  apply: boolean;
  /** Stop starting new products after this many milliseconds. */
  budgetMs?: number;
  /** Products to look at per run, oldest check first. */
  limit?: number;
  concurrency?: number;
  timeoutMs?: number;
  log?: (line: string) => void;
}

export interface ImageHealthReport {
  apply: boolean;
  checkedProducts: number;
  checkedImages: number;
  deadImages: number;
  unknownImages: number;
  imagesRemoved: number;
  productsArchived: string[];
  productsRestored: string[];
  categoriesFixed: string[];
  stoppedByBudget: boolean;
  durationMs: number;
}

interface ProductRow {
  id: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  metadata: Record<string, unknown> | null;
}

interface ImageRow {
  id: string;
  url: string;
  sortOrder: number;
  productId: string;
}

interface HealthMark {
  checkedAt?: string;
  archived?: boolean;
  archivedAt?: string;
}

const DEAD_STATUSES = new Set([404, 410]);

export async function checkImage(url: string, timeoutMs = 15000): Promise<ImageState> {
  if (!/^https?:\/\//i.test(url)) return "unknown";
  const target = url.split("#")[0];
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(target, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow", signal: controller.signal, cache: "no-store" });
      const type = res.headers.get("content-type") || "";
      await res.body?.cancel().catch(() => {});
      if (res.ok) return type.startsWith("text/html") ? "dead" : "live";
      if (DEAD_STATUSES.has(res.status)) return "dead";
      // A redirect that lands on an HTML error page (suspended hosting, login wall) is dead too.
      if (res.redirected && type.startsWith("text/html") && res.status >= 400) return "dead";
    } catch {
      // timeout or network error: retry once, then report unknown
    } finally {
      clearTimeout(timer);
    }
  }
  return "unknown";
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

async function withRetry<T>(fn: () => Promise<T>, log: (line: string) => void, attempts = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts) throw err;
      log(`database write failed (attempt ${attempt}/${attempts}), retrying: ${err instanceof Error ? err.message.split("\n").filter(Boolean).pop() : err}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

function markOf(metadata: Record<string, unknown> | null): HealthMark {
  const mark = metadata?.imageHealth;
  return mark && typeof mark === "object" ? (mark as HealthMark) : {};
}

export async function runImageHealth(options: ImageHealthOptions): Promise<ImageHealthReport> {
  const started = Date.now();
  const { apply, budgetMs = Infinity, limit = 100000, concurrency = 16, timeoutMs = 10000, log = () => {} } = options;
  const report: ImageHealthReport = {
    apply,
    checkedProducts: 0,
    checkedImages: 0,
    deadImages: 0,
    unknownImages: 0,
    imagesRemoved: 0,
    productsArchived: [],
    productsRestored: [],
    categoriesFixed: [],
    stoppedByBudget: false,
    durationMs: 0,
  };

  const products = await prisma.$queryRaw<ProductRow[]>`
    SELECT id, slug, status::text AS status, metadata
    FROM "Product"
    WHERE status = 'ACTIVE' OR (status = 'ARCHIVED' AND (metadata->'imageHealth'->>'archived') = 'true')
    ORDER BY (metadata->'imageHealth'->>'checkedAt') ASC NULLS FIRST
    LIMIT ${limit}`;
  log(`products to check: ${products.length}`);

  const batchSize = 50;
  for (let start = 0; start < products.length; start += batchSize) {
    if (Date.now() - started > budgetMs) {
      report.stoppedByBudget = true;
      break;
    }
    const batch = products.slice(start, start + batchSize);
    const images = await prisma.$queryRaw<ImageRow[]>`
      SELECT id, url, "sortOrder", "productId" FROM "ProductImage"
      WHERE "productId" = ANY(${batch.map((p) => p.id)}::text[])
      ORDER BY "productId", "sortOrder"`;
    // A product archived here only needs its cover re-checked to know whether it came back.
    const archivedHere = new Set(batch.filter((p) => p.status === "ARCHIVED" && markOf(p.metadata).archived === true).map((p) => p.id));
    const toCheck = images.filter((img) => !archivedHere.has(img.productId) || img.sortOrder === 0);
    const checked = new Map((await mapLimit(toCheck, concurrency, async (img) => [img.id, await checkImage(img.url, timeoutMs)] as const)).map(([id, state]) => [id, state]));
    const states = images.map((img) => checked.get(img.id) ?? ("unknown" as ImageState));
    const byProduct = new Map<string, Array<ImageRow & { state: ImageState }>>();
    images.forEach((img, i) => {
      const list = byProduct.get(img.productId) ?? [];
      list.push({ ...img, state: states[i] });
      byProduct.set(img.productId, list);
    });

    const now = new Date().toISOString();
    for (const product of batch) {
      const list = byProduct.get(product.id) ?? [];
      const mark = markOf(product.metadata);
      const dead = list.filter((i) => i.state === "dead");
      const kept = list.filter((i) => i.state !== "dead");
      const live = list.filter((i) => i.state === "live");
      report.checkedProducts++;
      report.checkedImages += list.length;
      report.deadImages += dead.length;
      report.unknownImages += list.filter((i) => i.state === "unknown").length;

      let nextMark: HealthMark = { ...mark, checkedAt: now };
      let nextStatus: ProductRow["status"] = product.status;
      const archivedHere = product.status === "ARCHIVED" && mark.archived === true;

      if (archivedHere) {
        if (live.length) {
          nextStatus = "ACTIVE";
          nextMark = { checkedAt: now };
          report.productsRestored.push(product.slug);
        }
      } else if (list.length && !kept.length) {
        nextStatus = "ARCHIVED";
        nextMark = { checkedAt: now, archived: true, archivedAt: now };
        report.productsArchived.push(product.slug);
      }

      // Drop dead images only while something else remains; an archived product keeps
      // its rows so a later run can bring it back if the supplier restores them.
      const removeDead = dead.length > 0 && kept.length > 0;
      if (removeDead) report.imagesRemoved += dead.length;

      if (!apply) continue;
      // One batched transaction: no interactive session to hold open through the pooler.
      await withRetry(() => prisma.$transaction([
        ...(removeDead ? [prisma.productImage.deleteMany({ where: { id: { in: dead.map((i) => i.id) } } })] : []),
        ...(removeDead
          ? kept.flatMap((img, order) => (img.sortOrder !== order ? [prisma.productImage.update({ where: { id: img.id }, data: { sortOrder: order } })] : []))
          : []),
        prisma.$executeRaw`
          UPDATE "Product"
          SET status = ${nextStatus}::"ProductStatus",
              metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{imageHealth}', ${JSON.stringify(nextMark)}::jsonb),
              "updatedAt" = CASE WHEN status::text <> ${nextStatus} THEN now() ELSE "updatedAt" END
          WHERE id = ${product.id}`,
      ]), log);
    }
    log(`checked ${Math.min(start + batchSize, products.length)}/${products.length}: dead images ${report.deadImages}, archived ${report.productsArchived.length}, restored ${report.productsRestored.length}`);
  }

  await fixCategoryImages(report, apply, concurrency, timeoutMs);
  report.durationMs = Date.now() - started;
  return report;
}

async function fixCategoryImages(report: ImageHealthReport, apply: boolean, concurrency: number, timeoutMs: number) {
  const categories = await prisma.$queryRaw<Array<{ id: string; slug: string; imageUrl: string | null }>>`
    SELECT id, slug, "imageUrl" FROM "Category"`;
  const states = await mapLimit(categories, concurrency, (c) => (c.imageUrl ? checkImage(c.imageUrl, timeoutMs) : Promise.resolve<ImageState>("dead")));
  const needCover = categories.filter((_, i) => states[i] === "dead");
  await mapLimit(needCover, 4, async (category) => {
    const candidates = await prisma.$queryRaw<Array<{ url: string }>>`
      SELECT pi.url FROM "ProductCategory" pc
      JOIN "Product" p ON p.id = pc."productId" AND p.status = 'ACTIVE'
      JOIN "ProductImage" pi ON pi."productId" = p.id AND pi."sortOrder" = 0
      WHERE pc."categoryId" = ${category.id}
      ORDER BY (p.metadata->'imageHealth'->>'checkedAt') DESC NULLS LAST
      LIMIT 12`;
    const candidateStates = await mapLimit(candidates, concurrency, (c) => checkImage(c.url, timeoutMs));
    const replacement = candidates.find((_, j) => candidateStates[j] === "live")?.url ?? null;
    // A category without a cover keeps waiting until a live product image turns up.
    if (!category.imageUrl && !replacement) return;
    report.categoriesFixed.push(category.slug);
    if (apply) await prisma.category.update({ where: { id: category.id }, data: { imageUrl: replacement } });
  });
}
