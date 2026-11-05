import "dotenv/config";
import { writeFileSync } from "node:fs";
import { runImageHealth } from "../src/lib/image-health";

// Checks every product image against its CDN, removes dead ones, archives products left
// without a live image and restores products whose images came back.
//
//   npm run images:check            report only, changes nothing
//   npm run images:check -- --apply write the changes
//   --limit <n>  --concurrency <n>  --report <file.json>

const argv = process.argv.slice(2);
const value = (flag: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};

async function main() {
  const apply = argv.includes("--apply");
  console.log(`=== image health ${apply ? "(APPLY)" : "(report only)"} ===`);
  const report = await runImageHealth({
    apply,
    limit: value("--limit") ? Number(value("--limit")) : undefined,
    concurrency: value("--concurrency") ? Number(value("--concurrency")) : 24,
    log: (line) => console.log(`  ${line}`),
  });
  const reportPath = value("--report");
  if (reportPath) writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(
    `\nproducts checked ${report.checkedProducts}, images ${report.checkedImages} (dead ${report.deadImages}, unknown ${report.unknownImages})` +
      `\n${apply ? "" : "would have "}removed ${report.imagesRemoved} dead images, archived ${report.productsArchived.length}, restored ${report.productsRestored.length}, fixed ${report.categoriesFixed.length} category images` +
      `\ntook ${(report.durationMs / 1000).toFixed(0)}s`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
