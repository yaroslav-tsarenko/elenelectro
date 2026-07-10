"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Chip } from "@heroui/react";
import { Package, MapPin, Heart, User as UserIcon, ChevronRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

const statusColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  PROCESSING: "accent",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default function AccountPage() {
  const t = useTranslations("account");
  const { user, loading } = useAuth();
  const { currency, convert } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data.data) ? data.data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
        {t("title")}
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
        {t("welcome", { name: user?.name || user?.email || "" })}
      </p>

      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <div className="p-5 border border-line rounded-xl bg-surface flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.04em] text-ink-subtle">Orders</span>
          <span className="text-2xl font-extrabold tracking-[-0.02em]">{orders.length}</span>
          <span className="text-xs text-ink-muted">All-time</span>
        </div>
        <div className="p-5 border border-line rounded-xl bg-surface flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.04em] text-ink-subtle">Total Spent</span>
          <span className="text-2xl font-extrabold tracking-[-0.02em]">{formatPrice(convert(totalSpent), currency)}</span>
          <span className="text-xs text-ink-muted">Across all orders</span>
        </div>
        <div className="p-5 border border-line rounded-xl bg-surface flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.04em] text-ink-subtle">Account</span>
          <span className="text-2xl font-extrabold tracking-[-0.02em]" style={{ fontSize: "1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</span>
          <span className="text-xs text-ink-muted">{user?.name || "No name set"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mt-6">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700 }}>Recent Orders</h2>
            <Link href="/account/orders" style={{ fontSize: "0.8125rem", color: "var(--color-accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {ordersLoading ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--color-text-tertiary)" }}>Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-text-tertiary)" }}>
              <Package size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
              <p style={{ fontSize: "0.875rem" }}>No orders yet</p>
              <Link href="/catalog" style={{ display: "inline-block", marginTop: "0.75rem", color: "var(--color-accent)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto_auto] max-sm:grid-cols-[1fr_auto] items-center gap-6 max-sm:gap-2 max-sm:gap-x-4 px-6 py-4 max-sm:px-4 max-sm:py-3.5 border border-line rounded-lg bg-surface no-underline text-ink transition-all hover:border-brand hover:-translate-y-px">
                  <div className="min-w-0 max-sm:col-span-full">
                    <div className="font-bold text-[0.9375rem]">#{order.orderNumber.slice(-8)}</div>
                    <div className="text-xs text-ink-subtle mt-0.5">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <Chip size="sm" color={statusColors[order.status] || "default"}>{order.status}</Chip>
                  <span className="font-bold text-[0.9375rem] max-sm:text-base whitespace-nowrap">{formatPrice(convert(Number(order.total)), currency)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border border-line rounded-xl bg-surface">
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.75rem" }}>Quick Links</h2>
          <Link href="/account/orders" className="flex items-center gap-3 px-2 py-3 rounded-md no-underline text-ink transition-colors text-sm hover:bg-surface-1">
            <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0"><Package size={16} /></span>
            <span style={{ flex: 1 }}>{t("orders")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/profile" className="flex items-center gap-3 px-2 py-3 rounded-md no-underline text-ink transition-colors text-sm hover:bg-surface-1">
            <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0"><UserIcon size={16} /></span>
            <span style={{ flex: 1 }}>{t("profile")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/addresses" className="flex items-center gap-3 px-2 py-3 rounded-md no-underline text-ink transition-colors text-sm hover:bg-surface-1">
            <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0"><MapPin size={16} /></span>
            <span style={{ flex: 1 }}>{t("addresses")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/wishlist" className="flex items-center gap-3 px-2 py-3 rounded-md no-underline text-ink transition-colors text-sm hover:bg-surface-1">
            <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0"><Heart size={16} /></span>
            <span style={{ flex: 1 }}>{t("wishlist")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
        </div>
      </div>
    </div>
  );
}
