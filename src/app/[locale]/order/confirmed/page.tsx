"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertTriangle, Package, MapPin, Truck, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { useCart } from "@/providers/CartProvider";
import type { OrderDetail } from "@/types/order";

function ConfirmedContent() {
  const t = useTranslations("notifications");
  const { currency, convert } = useCurrency();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentLinkId = searchParams.get("id");
  const checkoutId = searchParams.get("checkoutId");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(!!orderId || (!!paymentLinkId && !!checkoutId));

  useEffect(() => {
    if (paymentLinkId && checkoutId) {
      let isSubscribed = true;
      let intervalId: NodeJS.Timeout;

      const checkStatus = () => {
        fetch(`/api/orders/verify?paymentLinkId=${paymentLinkId}&checkoutId=${checkoutId}`)
          .then((res) => res.json())
          .then((data) => {
            if (!isSubscribed) return;
            if (data?.id) {
              setOrder(data);
              if (data.paymentStatus === "PAID") {
                clearCart();
                setLoading(false);
                clearInterval(intervalId);
              } else if (data.paymentStatus === "FAILED") {
                setLoading(false);
                clearInterval(intervalId);
              }
            }
          })
          .catch(() => {
            if (isSubscribed) {
              setOrder(null);
              setLoading(false);
              clearInterval(intervalId);
            }
          });
      };

      // Run immediately
      checkStatus();

      // Poll every 2 seconds
      intervalId = setInterval(checkStatus, 2000);

      return () => {
        isSubscribed = false;
        clearInterval(intervalId);
      };
    } else if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data?.id ? data : null);
          if (data?.paymentStatus === "PAID") {
            clearCart();
          }
        })
        .catch(() => setOrder(null))
        .finally(() => setLoading(false));
    }
  }, [orderId, paymentLinkId, checkoutId, clearCart]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1.5rem" }}>
        <LoadingSpinner />
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Checking payment status...</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>Please do not close or refresh this page.</p>
      </div>
    );
  }

  const isFailed = order?.paymentStatus === "FAILED";

  return (
    <div style={{ maxWidth: "640px", margin: "2rem auto 4rem", padding: "0 1rem" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: isFailed 
              ? "rgba(239, 68, 68, 0.12)"
              : "var(--color-success-light, rgba(34,197,94,0.12))",
            color: isFailed ? "var(--color-danger, #ef4444)" : "var(--color-success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          {isFailed ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
        </motion.div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          {isFailed ? "Payment Failed" : t("orderPlaced")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
          {isFailed 
            ? "Your payment transaction could not be completed. Please try again or use another payment method."
            : "Thank you for your order. We'll send a confirmation email shortly."}
        </p>
        {order && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
            Order <strong style={{ color: "var(--color-text)" }}>#{order.orderNumber.slice(-8)}</strong>
          </p>
        )}
      </motion.div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-bg)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Package size={18} color="var(--color-accent)" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Order Summary</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.875rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.125rem" }}>
                    Qty {item.quantity} × {formatPrice(convert(Number(item.price)), currency)}
                  </div>
                </div>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatPrice(convert(Number(item.total)), currency)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
              <span>{formatPrice(convert(Number(order.subtotal)), currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(convert(Number(order.shippingCost)), currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Tax</span>
              <span>{formatPrice(convert(Number(order.taxAmount)), currency)}</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              fontSize: "1.0625rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.625rem",
              marginTop: "0.375rem",
            }}>
              <span>Total</span>
              <span>{formatPrice(convert(Number(order.total)), currency)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ padding: "1rem 1.25rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <MapPin size={14} color="var(--color-accent)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-tertiary)" }}>
                Delivery to
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.address1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div style={{ padding: "1rem 1.25rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Truck size={14} color="var(--color-accent)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-tertiary)" }}>
                Next Steps
              </span>
            </div>
            {isFailed ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Please check your card details and try again. Alternatively, you can contact our customer support for assistance.
              </p>
            ) : (
              <ul style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, paddingLeft: "1rem", margin: 0 }}>
                <li>We&apos;ll prepare your order within 1–2 business days</li>
                <li>You&apos;ll receive a tracking link by email</li>
                <li>Estimated delivery depends on destination</li>
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {order && !isFailed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: "0.875rem 1rem",
            background: "var(--color-accent-light)",
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            marginBottom: "1.5rem",
            fontSize: "0.8125rem",
          }}
        >
          <Mail size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>
            A confirmation email has been sent to{" "}
            <strong>{order.customerEmail}</strong>
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <Button as={Link} href="/account/orders" variant="bordered" style={{ flex: "1 1 200px" }}>
          View Orders <ChevronRight size={16} />
        </Button>
        <Button as={Link} href="/catalog" color="primary" style={{ flex: "1 1 200px" }}>
          Continue Shopping
        </Button>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConfirmedContent />
    </Suspense>
  );
}
