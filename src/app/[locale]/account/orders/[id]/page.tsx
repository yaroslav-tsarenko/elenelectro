"use client";

import { useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Chip } from "@heroui/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";
import type { OrderDetail } from "@/types/order";

const statusColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  PROCESSING: "accent",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("account");
  const { currency, convert } = useCurrency();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <div style={{ padding: "2rem", textAlign: "center" }}>Order not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {t("orderNumber", { number: order.orderNumber.slice(-8) })}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
            Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' HH:mm")}
          </p>
        </div>
        <Chip size="lg" color={statusColors[order.status] || "default"}>{order.status}</Chip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="px-5 py-4 border border-line rounded-lg bg-surface">
          <div className="font-bold text-[0.8125rem] uppercase tracking-[0.04em] text-ink-subtle mb-2">Shipping Address</div>
          <div className="text-sm text-ink-muted leading-[1.5]">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.address1}<br />
            {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </div>
        </div>
        <div className="px-5 py-4 border border-line rounded-lg bg-surface">
          <div className="font-bold text-[0.8125rem] uppercase tracking-[0.04em] text-ink-subtle mb-2">Order Info</div>
          <div className="text-sm text-ink-muted leading-[1.5]">
            Payment: <strong>{order.paymentStatus}</strong>
            {order.paymentMethod && <><br />Method: {order.paymentMethod}</>}
            {order.shippingMethod && <><br />Shipping: {order.shippingMethod}</>}
            {order.trackingNumber && <><br />Tracking: <strong>{order.trackingNumber}</strong></>}
          </div>
        </div>
      </div>

      <div className="border border-line rounded-lg overflow-hidden bg-surface">
        <table className="w-full border-collapse max-sm:hidden [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.04em] [&_th]:text-ink-subtle [&_th]:bg-surface-1 [&_th]:border-b [&_th]:border-line [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:border-b [&_td]:border-line [&_tr:last-child_td]:border-b-0">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  {item.variantName && <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{item.variantName}</div>}
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>SKU: {item.productSku}</div>
                </td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>{formatPrice(convert(Number(item.price)), currency)}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{formatPrice(convert(Number(item.total)), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="hidden max-sm:flex flex-col">
          {order.items.map((item) => (
            <div key={item.id} className="px-4 py-3.5 border-b border-line last:border-b-0 flex flex-col gap-1">
              <div className="font-semibold text-sm">{item.productName}</div>
              {item.variantName && <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{item.variantName}</div>}
              <div className="flex justify-between text-xs text-ink-subtle">
                <span>Qty {item.quantity} × {formatPrice(convert(Number(item.price)), currency)}</span>
                <span className="font-bold text-ink">{formatPrice(convert(Number(item.total)), currency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 flex flex-col items-end gap-1 text-sm border-t border-line bg-surface-1">
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
            <span>{formatPrice(convert(Number(order.subtotal)), currency)}</span>
          </div>
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
            <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(convert(Number(order.shippingCost)), currency)}</span>
          </div>
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Tax</span>
            <span>{formatPrice(convert(Number(order.taxAmount)), currency)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex gap-4">
              <span style={{ color: "var(--color-success)" }}>Discount</span>
              <span style={{ color: "var(--color-success)" }}>−{formatPrice(convert(Number(order.discountAmount)), currency)}</span>
            </div>
          )}
          <div className="flex gap-4 font-extrabold text-lg pt-2 mt-1 border-t border-line w-full justify-between">
            <span>Total</span>
            <span>{formatPrice(convert(Number(order.total)), currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
