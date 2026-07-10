const API_BASE = "/api";

export async function fetchCartProducts(productIds: string[]) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) throw new Error("Failed to fetch cart products");
  return res.json();
}

export async function validateCart(items: { productId: string; quantity: number }[]) {
  const res = await fetch(`${API_BASE}/cart/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to validate cart");
  return res.json();
}
