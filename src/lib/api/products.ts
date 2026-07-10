const API_BASE = "/api";

export async function fetchProducts(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/products?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(idOrSlug: string) {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

export async function bulkAction(action: string, productIds: string[]) {
  const res = await fetch(`${API_BASE}/products/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, productIds }),
  });
  if (!res.ok) throw new Error("Bulk action failed");
  return res.json();
}
