"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingCart, Shield, Truck, RotateCcw, Lock } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

const WARRANTY_OPTIONS = [
  { key: "none", years: 0, percent: 0, min: 0 },
  { key: "1year", years: 1, percent: 10, min: 6.99 },
  { key: "2year", years: 2, percent: 16, min: 9.99 },
  { key: "3year", years: 3, percent: 22, min: 12.99 },
];

// Hide additional warranty for low-priced items where the minimum
// charge would be disproportionate to the product price.
const WARRANTY_MIN_PRODUCT_PRICE = 15;

function calcWarrantyPrice(productPrice: number, option: typeof WARRANTY_OPTIONS[number]): number {
  if (option.percent === 0) return 0;
  return Math.max(productPrice * (option.percent / 100), option.min);
}

interface ProductInfoProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  quantity: number;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  condition: string;
  lowStockAlert: number;
  imageUrl?: string | null;
  ean?: string | null;
  reviewCount?: number;
  avgRating?: number;
  categoryPath?: { name: string; slug: string }[];
}

export function ProductInfo({
  id,
  name,
  slug,
  sku,
  price,
  comparePrice,
  quantity: stockQuantity,
  shortDescription,
  brand,
  condition,
  lowStockAlert,
  imageUrl,
  ean,
  reviewCount = 0,
  avgRating = 0,
}: ProductInfoProps) {
  const t = useTranslations("product");
  const [qty, setQty] = useState(1);
  const [selectedWarranty, setSelectedWarranty] = useState(0);
  const { addItem } = useCart();
  const { currency, convert } = useCurrency();
  const router = useRouter();

  const outOfStock = stockQuantity <= 0;
  const lowStock = stockQuantity > 0 && stockQuantity <= lowStockAlert;

  const warrantyAvailable = price >= WARRANTY_MIN_PRODUCT_PRICE;
  const warrantyOption = warrantyAvailable ? WARRANTY_OPTIONS[selectedWarranty] : WARRANTY_OPTIONS[0];
  const warrantyPrice = calcWarrantyPrice(price, warrantyOption);
  const totalPrice = price + warrantyPrice;

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name: warrantyOption.years > 0
        ? `${name} + ${warrantyOption.years}yr warranty`
        : name,
      slug,
      sku,
      price: totalPrice,
      quantity: qty,
      imageUrl: imageUrl || null,
      maxQuantity: stockQuantity,
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: id,
      name: warrantyOption.years > 0
        ? `${name} + ${warrantyOption.years}yr warranty`
        : name,
      slug,
      sku,
      price: totalPrice,
      quantity: qty,
      imageUrl: imageUrl || null,
      maxQuantity: stockQuantity,
    });
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (data.action === "added") {
        toast.success(t("addToWishlist"));
      } else {
        toast.success(t("removeFromWishlist"));
      }
    } catch {
      toast.error("Please log in to use wishlist");
    }
  };

  const isOnSale = comparePrice && comparePrice > price;
  const savingsPercent = isOnSale
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 max-sm:gap-4">
      <div>
        <h1 className="text-[1.75rem] max-md:text-[1.375rem] max-[480px]:text-xl font-extrabold leading-[1.15] tracking-[-0.02em] break-words [overflow-wrap:anywhere]">{name}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-ink-subtle">{t("sku")}: {sku}</span>
          {ean && <span className="text-xs text-ink-subtle">{t("ean")}: {ean}</span>}
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-warning">
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
              <span className="text-ink-subtle font-normal">({reviewCount})</span>
            </span>
          )}
        </div>
      </div>

      {shortDescription && <p className="text-[0.9375rem] text-ink-muted leading-[1.65]">{shortDescription}</p>}

      <hr className="h-px bg-line border-0 m-0" />

      <div className="flex items-center gap-4">
        <PriceDisplay price={price} comparePrice={comparePrice} size="lg" />
        {isOnSale && <span className="text-xs font-bold text-white bg-danger px-2.5 py-1 rounded-pill">-{savingsPercent}%</span>}
      </div>

      <p
        className={`text-[0.8125rem] font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill ${outOfStock ? "text-danger bg-danger/10" : lowStock ? "text-warning bg-warning/10" : "text-success bg-success/10"}`}
      >
        {outOfStock
          ? t("outOfStock")
          : lowStock
            ? t("onlyLeft", { count: stockQuantity })
            : t("inStock")}
      </p>

      <hr className="h-px bg-line border-0 m-0" />

      <div className="flex flex-col gap-2">
        <span className="text-[0.8125rem] font-bold text-ink flex items-center gap-1.5">
          <Shield size={14} /> {t("warranty")}
        </span>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
          {t("warrantyStandard")}
        </p>
        {warrantyAvailable && (
          <div className="grid grid-cols-2 gap-2">
            {WARRANTY_OPTIONS.map((opt, idx) => (
              <button
                key={opt.key}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 border-2 rounded-lg bg-surface cursor-pointer transition-all text-[0.8125rem] font-semibold text-ink text-center ${idx === selectedWarranty ? "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--color-accent)]" : "border-line hover:border-brand hover:bg-brand-soft"}`}
                onClick={() => setSelectedWarranty(idx)}
              >
                {idx === 0 ? t("noWarranty") : t(`warrantyOption${opt.years}year` as "warrantyOption1year" | "warrantyOption2year" | "warrantyOption3year")}
                {opt.percent > 0 && (
                  <span className="text-[0.6875rem] font-normal text-ink-muted">+{formatPrice(convert(calcWarrantyPrice(price, opt)), currency)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 max-[480px]:gap-2 items-center flex-wrap [&>button]:min-w-0">
        <QuantitySelector
          quantity={qty}
          maxQuantity={stockQuantity}
          onChange={setQty}
        />
        <Button
          color="primary"
          size="lg"
          onPress={handleAddToCart}
          isDisabled={outOfStock}
          startContent={<ShoppingCart size={18} />}
          style={{ flex: 1 }}
        >
          {selectedWarranty > 0 ? t("addToCartWithWarranty") : t("addToCart")}
        </Button>
        <Button
          color="default"
          size="lg"
          onPress={handleBuyNow}
          isDisabled={outOfStock}
          className="!bg-ink !text-surface font-bold hover:opacity-85"
        >
          {t("buyNow")}
        </Button>
        <Button
          isIconOnly
          variant="bordered"
          size="lg"
          onPress={handleWishlist}
          aria-label={t("addToWishlist")}
        >
          <Heart size={18} />
        </Button>
      </div>

      <div className="border-t border-line pt-4">
        {brand && (
          <div className="flex justify-between py-2 text-sm border-b border-surface-2 last:border-b-0">
            <span className="text-ink-muted">{t("brand")}</span>
            <span className="text-ink font-semibold">{brand}</span>
          </div>
        )}
        <div className="flex justify-between py-2 text-sm border-b border-surface-2 last:border-b-0">
          <span className="text-ink-muted">{t("condition")}</span>
          <span className="text-ink font-semibold">{condition}</span>
        </div>
        <div className="flex justify-between py-2 text-sm border-b border-surface-2 last:border-b-0">
          <span className="text-ink-muted">{t("sku")}</span>
          <span className="text-ink font-semibold">{sku}</span>
        </div>
        {ean && (
          <div className="flex justify-between py-2 text-sm border-b border-surface-2 last:border-b-0">
            <span className="text-ink-muted">{t("ean")}</span>
            <span className="text-ink font-semibold">{ean}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 max-[380px]:gap-2 pt-2">
        <div className="flex flex-col items-center gap-1 text-center px-2 py-3 max-[380px]:px-1.5 max-[380px]:py-2.5 rounded-lg bg-surface-1">
          <Truck size={18} className="text-brand" />
          <span className="text-[0.6875rem] font-bold text-ink">{t("freeShipping")}</span>
          <span className="text-[0.625rem] text-ink-subtle">{t("freeShippingDesc")}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center px-2 py-3 max-[380px]:px-1.5 max-[380px]:py-2.5 rounded-lg bg-surface-1">
          <RotateCcw size={18} className="text-brand" />
          <span className="text-[0.6875rem] font-bold text-ink">{t("easyReturns")}</span>
          <span className="text-[0.625rem] text-ink-subtle">{t("easyReturnsDesc")}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center px-2 py-3 max-[380px]:px-1.5 max-[380px]:py-2.5 rounded-lg bg-surface-1">
          <Lock size={18} className="text-brand" />
          <span className="text-[0.6875rem] font-bold text-ink">{t("securePayment")}</span>
          <span className="text-[0.625rem] text-ink-subtle">{t("securePaymentDesc")}</span>
        </div>
      </div>
    </div>
  );
}
