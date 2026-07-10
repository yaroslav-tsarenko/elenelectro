"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, Activity,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/format-price";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/admin/RevenueChart/RevenueChart").then((m) => m.RevenueChart),
  { ssr: false }
);
const OrdersBarChart = dynamic(
  () => import("@/components/admin/charts/OrdersBarChart").then((m) => m.OrdersBarChart),
  { ssr: false }
);
const OrderStatusChart = dynamic(
  () => import("@/components/admin/charts/OrderStatusChart").then((m) => m.OrderStatusChart),
  { ssr: false }
);
const CategoryChart = dynamic(
  () => import("@/components/admin/charts/CategoryChart").then((m) => m.CategoryChart),
  { ssr: false }
);
const StockDonutChart = dynamic(
  () => import("@/components/admin/charts/StockDonutChart").then((m) => m.StockDonutChart),
  { ssr: false }
);
const ReviewsChart = dynamic(
  () => import("@/components/admin/charts/ReviewsChart").then((m) => m.ReviewsChart),
  { ssr: false }
);

interface Analytics {
  todayOrders: number;
  todayRevenue: number;
  yesterdayOrders: number;
  yesterdayRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  lastMonthOrders: number;
  lastMonthRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    user: { name: string | null; email: string };
    _count: { items: number };
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  ordersByStatus: { status: string; _count: number }[];
  revenueByDay: {
    createdAt: string;
    _sum: { total: number };
    _count: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    _sum: { quantity: number; total: number };
  }[];
  categoryStats: { id: string; name: string; slug: string; _count: { products: number } }[];
  recentCustomers: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    _count: { orders: number; reviews: number };
  }[];
  reviewStats: { rating: number; _count: number }[];
  weeklyOrders: { total: number; createdAt: string; status: string }[];
  stockDistribution: { outOfStock: number; lowStock: number; inStock: number };
}

const STATUS_MAP: Record<string, string> = {
  PENDING: "admin-badge-warning",
  CONFIRMED: "admin-badge-accent",
  PROCESSING: "admin-badge-accent",
  SHIPPED: "admin-badge-accent",
  DELIVERED: "admin-badge-success",
  CANCELLED: "admin-badge-danger",
  REFUNDED: "admin-badge-default",
};

function pct(current: number, previous: number) {
  if (previous === 0) return { value: current > 0 ? "+100%" : "0%", up: current >= 0 };
  const c = ((current - previous) / previous) * 100;
  return { value: `${c >= 0 ? "+" : ""}${c.toFixed(1)}%`, up: c >= 0 };
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
} as const;

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) return;
        setData({
          ...d,
          topProducts: d.topProducts || [],
          recentOrders: d.recentOrders || [],
          lowStockProducts: d.lowStockProducts || [],
          revenueByDay: d.revenueByDay || [],
          ordersByStatus: d.ordersByStatus || [],
          categoryStats: d.categoryStats || [],
          recentCustomers: d.recentCustomers || [],
          reviewStats: d.reviewStats || [],
          weeklyOrders: d.weeklyOrders || [],
          stockDistribution: d.stockDistribution || { outOfStock: 0, lowStock: 0, inStock: 0 },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="admin-empty">Failed to load analytics</div>;

  const revChange = pct(data.todayRevenue, data.yesterdayRevenue);
  const monthRevChange = pct(data.thisMonthRevenue, data.lastMonthRevenue);
  const monthOrdChange = pct(data.thisMonthOrders, data.lastMonthOrders);

  const kpis = [
    { label: "Today's Revenue", value: formatPrice(data.todayRevenue), icon: <DollarSign size={18} />, bg: "rgba(0,200,83,0.12)", fg: "#00C853", change: revChange, sub: `vs ${formatPrice(data.yesterdayRevenue)} yesterday` },
    { label: "Today's Orders", value: String(data.todayOrders), icon: <ShoppingCart size={18} />, bg: "rgba(10,132,255,0.12)", fg: "#0A84FF", change: pct(data.todayOrders, data.yesterdayOrders), sub: `vs ${data.yesterdayOrders} yesterday` },
    { label: "Total Products", value: String(data.totalProducts), icon: <Package size={18} />, bg: "rgba(139,92,246,0.12)", fg: "#8b5cf6", sub: `${data.stockDistribution.lowStock} low stock` },
    { label: "Total Customers", value: String(data.totalCustomers), icon: <Users size={18} />, bg: "rgba(245,158,11,0.12)", fg: "#F59E0B", sub: `${data.totalOrders} total orders` },
  ];

  const topMax = data.topProducts.length > 0 ? Number(data.topProducts[0]._sum.total) : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Title */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Overview of your store performance</p>
        </div>
        <span className="admin-badge admin-badge-success">
          <Activity size={12} /> Live
        </span>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid gap-section">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="kpi-card-header">
              <div className="kpi-card-icon" style={{ background: kpi.bg, color: kpi.fg }}>
                {kpi.icon}
              </div>
              {kpi.change && (
                <span className={`kpi-card-change ${kpi.change.up ? "kpi-card-change-up" : "kpi-card-change-down"}`}>
                  {kpi.change.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change.value}
                </span>
              )}
            </div>
            <div className="kpi-card-value">{kpi.value}</div>
            <div className="kpi-card-label">{kpi.label}</div>
            {kpi.sub && <div className="kpi-card-sub">{kpi.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Summary Strip */}
      <div className="stat-strip gap-section">
        {[
          { label: "This Month Revenue", value: formatPrice(data.thisMonthRevenue), change: monthRevChange },
          { label: "This Month Orders", value: String(data.thisMonthOrders), change: monthOrdChange },
          { label: "Avg Order Value", value: formatPrice(data.avgOrderValue) },
          { label: "Total Revenue", value: formatPrice(data.totalRevenue) },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-mini"
            custom={i + 4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="stat-mini-label">{s.label}</div>
            <div className="stat-mini-row">
              <span className="stat-mini-value">{s.value}</span>
              {s.change && (
                <span className="stat-mini-change" style={{ color: s.change.up ? "var(--admin-success)" : "var(--admin-danger)" }}>
                  {s.change.value}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <motion.div
        className="chart-grid-2 gap-section"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Revenue — Last 30 Days</span>
              <span className="admin-badge admin-badge-success">
                <ArrowUpRight size={10} /> {monthRevChange.value}
              </span>
            </div>
            <RevenueChart data={data.revenueByDay} />
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Orders — This Week</span>
              <span className="admin-badge admin-badge-default">{data.weeklyOrders.length} orders</span>
            </div>
            <OrdersBarChart data={data.weeklyOrders} />
          </div>
        </div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div
        className="chart-grid-3 gap-section"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Order Status</span>
            </div>
            <OrderStatusChart data={data.ordersByStatus} />
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Products by Category</span>
            </div>
            <CategoryChart data={data.categoryStats} />
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Inventory & Reviews</span>
            </div>
            <StockDonutChart data={data.stockDistribution} />
            <div style={{ marginTop: "1rem", borderTop: "1px solid var(--admin-border)", paddingTop: "0.75rem" }}>
              <ReviewsChart data={data.reviewStats} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Products + Recent Customers */}
      <motion.div
        className="chart-grid-3-2 gap-section"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Top Selling Products</span>
              <span className="admin-badge admin-badge-success">Best Sellers</span>
            </div>
            {data.topProducts.length === 0 ? (
              <div className="admin-empty">No sales data yet</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Revenue</th>
                    <th style={{ minWidth: 100 }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.slice(0, 8).map((p, i) => {
                    const share = Math.round((Number(p._sum.total) / topMax) * 100);
                    return (
                      <tr key={p.productId}>
                        <td>
                          <span className={`rank-badge ${i < 3 ? `rank-${i + 1}` : "rank-default"}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: "var(--admin-text)" }}>{p.productName}</td>
                        <td>{Number(p._sum.quantity)}</td>
                        <td style={{ fontWeight: 600, color: "var(--admin-text)" }}>{formatPrice(Number(p._sum.total))}</td>
                        <td>
                          <div className="admin-progress">
                            <div
                              className="admin-progress-fill"
                              style={{
                                width: `${share}%`,
                                background: i < 3 ? "var(--admin-success)" : "var(--admin-accent)",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Recent Customers</span>
              <span className="admin-badge admin-badge-default">{data.totalCustomers}</span>
            </div>
            {data.recentCustomers.length === 0 ? (
              <div className="admin-empty">No customers yet</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Reviews</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--admin-text)" }}>{c.name || "—"}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--admin-text-muted)" }}>{c.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-default">{c._count.orders}</span>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-default">{c._count.reviews}</span>
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Orders + Low Stock */}
      <motion.div
        className="chart-grid-2 gap-section"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title">Recent Orders</span>
              <span className="admin-badge admin-badge-default">{data.totalOrders} total</span>
            </div>
            {data.recentOrders.length === 0 ? (
              <div className="admin-empty">No orders yet</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--admin-text)" }}>
                        #{o.orderNumber.slice(-6)}
                      </td>
                      <td>{o.user.name || o.user.email}</td>
                      <td>{o._count.items}</td>
                      <td>
                        <span className={`admin-badge ${STATUS_MAP[o.status] || "admin-badge-default"}`}>
                          {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--admin-text)" }}>{formatPrice(Number(o.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <span className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <AlertTriangle size={14} style={{ color: "var(--admin-warning)" }} />
                Low Stock Alert
              </span>
              <span className="admin-badge admin-badge-warning">{data.lowStockProducts.length}</span>
            </div>
            {data.lowStockProducts.length === 0 ? (
              <div className="admin-empty">All products well-stocked!</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--admin-text)" }}>{p.name}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{p.sku}</td>
                      <td>{formatPrice(Number(p.price))}</td>
                      <td>
                        <span className={`admin-badge ${p.quantity === 0 ? "admin-badge-danger" : "admin-badge-warning"}`}>
                          {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
