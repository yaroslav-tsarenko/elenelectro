const API_BASE = "/api";

export async function searchProducts(query: string, limit: number = 10) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}
