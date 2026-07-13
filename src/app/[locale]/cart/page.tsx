"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRight, ShieldCheck, Trash2, Package, Truck, ImageOff } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { formatPrice } from "@/lib/utils/format-price";

export default function CartPage() {
  const t = useTranslations("cart");
  const nav = useTranslations("nav");
  const { cart, updateQuantity, removeItem } = useCart();
  const { currency, convert } = useCurrency();

  const freeShippingThreshold = convert(100);
  const subtotalConverted = convert(cart.subtotal);

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("title") }]} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[1.75rem] max-[480px]:text-[1.375rem] font-extrabold tracking-[-0.03em] mb-6 max-[480px]:mb-4"
      >
        {t("title")}{" "}
        {cart.items.length > 0 && (
          <span style={{ color: "var(--color-text-tertiary)", fontWeight: 500 }}>
            ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
          </span>
        )}
      </motion.h1>

      {cart.items.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <EmptyState
            title={t("empty")}
            subtitle={t("emptySubtitle")}
            actionLabel={t("continueShopping")}
            actionHref="/catalog"
            icon={<ShoppingCart size={48} />}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 lg:gap-10 items-start">
          {/* Cart Items */}
          <div className="border border-line rounded-xl overflow-hidden bg-surface">
            <div className="flex items-center justify-between px-6 py-4 max-[480px]:px-4 max-[480px]:py-3 max-[480px]:text-[0.8125rem] border-b border-line bg-surface-1 flex-wrap gap-2">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Package size={16} style={{ color: "var(--color-text-secondary)" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in your cart
                </span>
              </div>
              {subtotalConverted >= freeShippingThreshold && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "#2E7D32" }}>
                  <Truck size={14} />
                  Free shipping
                </div>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, padding: 0, margin: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  className="flex gap-5 max-sm:gap-3.5 px-6 py-5 max-sm:px-4 max-sm:py-4 items-center max-sm:items-start [&+&]:border-t [&+&]:border-line"
                >
                  <div className="relative w-24 h-24 max-sm:w-[72px] max-sm:h-[72px] rounded-lg overflow-hidden bg-white border border-line shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="100px"
                        style={{ objectFit: "contain", padding: "8px" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                        <ImageOff size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <Link href={`/product/${item.slug}`} className="text-[0.9375rem] max-sm:text-sm font-semibold text-ink no-underline line-clamp-2 break-words [overflow-wrap:anywhere]">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                        {item.variantName}
                      </span>
                    )}
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                      SKU: {item.sku}
                    </span>

                    <div className="flex items-center justify-between mt-auto pt-2 gap-3 max-[480px]:flex-wrap max-[480px]:gap-2.5 max-[480px]:pt-1">
                      <QuantitySelector
                        quantity={item.quantity}
                        maxQuantity={item.maxQuantity}
                        onChange={(qty) => updateQuantity(item.productId, qty, item.variantId)}
                      />
                      <div className="flex items-center gap-4 max-[480px]:gap-2 max-[480px]:ml-auto">
                        <PriceDisplay price={item.price * item.quantity} size="sm" />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.productId, item.variantId)}
                          style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "var(--radius-lg)",
                            border: "none",
                            background: "transparent",
                            color: "var(--color-text-tertiary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "color 0.15s, background 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-bg-tertiary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-7 max-sm:p-5 border border-line rounded-xl max-sm:rounded-lg bg-surface h-fit lg:sticky lg:top-[calc(var(--header-height)+var(--announcement-height)+1rem)] max-lg:static"
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{t("subtotal")}</span>
                <span style={{ fontWeight: 500 }}>{formatPrice(convert(cart.subtotal), currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{t("shipping")}</span>
                <span style={{ fontWeight: 600, color: cart.shippingCost === 0 ? "#2E7D32" : undefined }}>
                  {cart.shippingCost > 0 ? formatPrice(convert(cart.shippingCost), currency) : "Free"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{t("tax")} (21%)</span>
                <span style={{ fontWeight: 500 }}>{formatPrice(convert(cart.taxAmount), currency)}</span>
              </div>

              {subtotalConverted < freeShippingThreshold && (
                <div
                  style={{
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-secondary)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <Truck size={14} />
                  Add {formatPrice(freeShippingThreshold - subtotalConverted, currency)} more for free shipping
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  borderTop: "2px solid var(--color-border)",
                  paddingTop: "1rem",
                  marginTop: "0.25rem",
                }}
              >
                <span>{t("total")}</span>
                <span>{formatPrice(convert(cart.total), currency)}</span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/checkout" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-brand text-white font-bold text-base no-underline shadow-[0_4px_14px_rgba(27,77,255,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(27,77,255,0.4)]">
                {t("checkout")} <ArrowRight size={18} />
              </Link>
            </motion.div>

            <Link
              href="/catalog"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "0.875rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-accent)",
              }}
            >
              {t("continueShopping")}
            </Link>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.375rem",
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border)",
              fontSize: "0.75rem",
              color: "var(--color-text-tertiary)",
            }}>
              <ShieldCheck size={14} />
              Secure checkout with SSL encryption
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
