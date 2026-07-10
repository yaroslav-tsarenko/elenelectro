"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Chip } from "@heroui/react";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";
import { Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string }[];
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

export default function OrdersPage() {
  const t = useTranslations("account");
  const nav = useTranslations("nav");
  const { user } = useAuth();
  const { currency, convert } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>{t("orders")}</h1>

      {orders.length === 0 ? (
        <EmptyState
          title={t("noOrders")}
          subtitle={t("noOrdersSubtitle")}
          actionLabel={nav("catalog")}
          actionHref="/catalog"
          icon={<Package size={48} />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto_auto] max-sm:grid-cols-[1fr_auto] items-center gap-6 max-sm:gap-2 max-sm:gap-x-4 px-6 py-4 max-sm:px-4 max-sm:py-3.5 border border-line rounded-lg bg-surface no-underline text-ink transition-all hover:border-brand hover:-translate-y-px">
              <div className="min-w-0 max-sm:col-span-full">
                <div className="font-bold text-[0.9375rem]">#{order.orderNumber.slice(-8)}</div>
                <div className="text-xs text-ink-subtle mt-0.5">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                <div className="text-xs text-ink-subtle mt-1">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </div>
              </div>
              <Chip size="sm" color={statusColors[order.status] || "default"}>{order.status}</Chip>
              <span className="font-bold text-[0.9375rem] max-sm:text-base whitespace-nowrap">{formatPrice(convert(Number(order.total)), currency)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
