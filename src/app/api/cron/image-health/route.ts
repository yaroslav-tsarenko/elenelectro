import { revalidatePath } from "next/cache";
import { runImageHealth } from "@/lib/image-health";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel Cron calls this daily (vercel.json) with "Authorization: Bearer <CRON_SECRET>".
// Each run checks the products whose images were checked longest ago, so the whole
// catalogue is covered over a few days.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const report = await runImageHealth({ apply: true, budgetMs: 240_000, limit: 5000, concurrency: 32 });
  const changed = report.imagesRemoved + report.productsArchived.length + report.productsRestored.length + report.categoriesFixed.length;
  if (changed) revalidatePath("/", "layout");

  console.log(`[image-health] ${JSON.stringify({ ...report, productsArchived: report.productsArchived.length, productsRestored: report.productsRestored.length })}`);
  return Response.json(report);
}
