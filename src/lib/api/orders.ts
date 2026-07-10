const API_BASE = "/api";

export async function fetchOrders(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/orders?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function fetchOrder(id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function updateOrderStatus(id: string, status: string, trackingNumber?: string) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, trackingNumber }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function createOrder(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}
