"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
  items: { id: string }[];
}

const statusColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  PENDING: "warning", CONFIRMED: "accent", PROCESSING: "accent",
  SHIPPED: "default", DELIVERED: "success", CANCELLED: "danger", REFUNDED: "danger",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/orders?${params}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
        <select
          className="admin-select"
          style={{ maxWidth: "12rem" }}
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="admin-table-container">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 600, color: "var(--admin-accent)" }}>
                      #{order.orderNumber.slice(-8)}
                    </Link>
                  </td>
                  <td>{order.user.name || order.user.email}</td>
                  <td style={{ textAlign: "center" }}>
                    <Chip size="sm" color={statusColors[order.status]}>{order.status}</Chip>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "var(--admin-text)" }}>{formatPrice(Number(order.total))}</td>
                  <td style={{ textAlign: "right", color: "var(--admin-text-muted)" }}>{format(new Date(order.createdAt), "MMM d, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
