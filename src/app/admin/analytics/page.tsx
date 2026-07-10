"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/admin/RevenueChart/RevenueChart").then((m) => m.RevenueChart),
  { ssr: false }
);

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="admin-empty">Failed to load analytics</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Analytics</h1>

      <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-card-body">
          <div className="admin-card-header">
            <span className="admin-card-title">Revenue (Last 30 Days)</span>
          </div>
          <RevenueChart data={(data.revenueByDay as { createdAt: string; _sum: { total: number }; _count: number }[]) || []} />
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <div className="admin-card-header">
            <span className="admin-card-title">Top Products</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            {((data.topProducts as { productName: string; _sum: { quantity: number; total: number } }[]) || []).map((product, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--admin-border)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--admin-text)" }}>{i + 1}. {product.productName}</span>
                <div style={{ display: "flex", gap: "2rem" }}>
                  <span style={{ color: "var(--admin-text-muted)" }}>{product._sum.quantity} sold</span>
                  <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{formatPrice(Number(product._sum.total))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
