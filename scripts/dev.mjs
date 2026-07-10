import { spawn, execSync } from "child_process";
import fs from "node:fs";

const DB_PORTS = [51213, 51214, 51215];
const NEXT_PORT = 3000;

function killPort(port) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: "utf-8" }).trim();
    if (pids) {
      execSync(`kill -9 ${pids.split("\n").join(" ")}`, { stdio: "ignore" });
      console.log(`  killed process on :${port}`);
    }
  } catch {
    // nothing on that port
  }
}

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const file of [".env.local", ".env"]) {
    try {
      const contents = fs.readFileSync(file, "utf-8");
      for (const raw of contents.split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        if (line.slice(0, eq).trim() !== "DATABASE_URL") continue;
        let val = line.slice(eq + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        return val;
      }
    } catch {
      // file missing, skip
    }
  }
  return "";
}

function isLocalPrismaPostgres(url) {
  return /^prisma\+postgres:\/\/localhost/i.test(url) || /^postgres(ql)?:\/\/(localhost|127\.0\.0\.1)/i.test(url);
}

console.log("\n[dev] Cleaning up old processes...");
for (const port of [...DB_PORTS, NEXT_PORT]) {
  killPort(port);
}

const dbUrl = readDatabaseUrl();
const needsLocalDb = isLocalPrismaPostgres(dbUrl);

let db = null;
if (!needsLocalDb) {
  console.log("[dev] DATABASE_URL points to a remote database — skipping local prisma dev.");
} else {
  console.log("[dev] Starting Prisma Postgres...");
  db = spawn("npx", ["prisma", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });
}

let nextStarted = false;

function startNext() {
  if (nextStarted) return;
  nextStarted = true;
  console.log("[dev] Starting Next.js...\n");
  const next = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  next.on("exit", (code) => {
    db?.kill();
    process.exit(code ?? 0);
  });
}

if (db) {
  db.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[prisma] ${text}`);
    if (text.includes("now running") || text.includes("DATABASE_URL")) {
      startNext();
    }
  });

  db.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(`[prisma] ${text}`);
    if (text.includes("now running") || text.includes("DATABASE_URL")) {
      startNext();
    }
  });

  // If prisma dev doesn't print a ready message, start Next after a timeout
  setTimeout(() => startNext(), 5000);

  db.on("exit", (code) => {
    if (!nextStarted) {
      console.error("[dev] Prisma Postgres exited unexpectedly with code", code);
      process.exit(1);
    }
  });
} else {
  startNext();
}

process.on("SIGINT", () => {
  db?.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  db?.kill();
  process.exit(0);
});
