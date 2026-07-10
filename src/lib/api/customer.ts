const API_BASE = "/api";

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function toggleWishlist(productId: string) {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to update wishlist");
  return res.json();
}

export async function fetchWishlist() {
  const res = await fetch(`${API_BASE}/wishlist`);
  if (!res.ok) throw new Error("Failed to fetch wishlist");
  return res.json();
}
