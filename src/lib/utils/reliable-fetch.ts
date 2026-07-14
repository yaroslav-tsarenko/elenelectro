const DEFAULT_RETRIES = 3;
const BACKOFF_MS = 400;

export async function reliableFetch(input: string, init?: RequestInit, retries = DEFAULT_RETRIES): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, init);
      if (res.ok || res.status === 404) return res;
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries) {
      const delay = BACKOFF_MS * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Fetch failed");
}

const MEM_CACHE = new Map<string, { data: unknown; ts: number }>();

export interface CachedFetchOptions {
  cacheKey: string;
  ttlMs?: number;
  retries?: number;
  storage?: "session" | "local" | "memory";
}

function getStorage(kind: "session" | "local" | "memory"): Storage | null {
  if (kind === "memory" || typeof window === "undefined") return null;
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readCached<T = unknown>(opts: Pick<CachedFetchOptions, "cacheKey" | "storage" | "ttlMs">): T | null {
  const { cacheKey, storage = "session", ttlMs } = opts;
  const now = Date.now();
  const mem = MEM_CACHE.get(cacheKey);
  if (mem && (!ttlMs || now - mem.ts <= ttlMs)) return mem.data as T;
  const store = getStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; ts: number };
    if (ttlMs && now - parsed.ts > ttlMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCached<T = unknown>(opts: Pick<CachedFetchOptions, "cacheKey" | "storage">, data: T): void {
  const { cacheKey, storage = "session" } = opts;
  const entry = { data, ts: Date.now() };
  MEM_CACHE.set(cacheKey, entry);
  const store = getStorage(storage);
  if (!store) return;
  try {
    store.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — ignore
  }
}

export async function cachedFetchJSON<T = unknown>(
  input: string,
  opts: CachedFetchOptions,
  init?: RequestInit,
): Promise<T> {
  const res = await reliableFetch(input, init, opts.retries);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = (await res.json()) as T;
  writeCached(opts, data);
  return data;
}
