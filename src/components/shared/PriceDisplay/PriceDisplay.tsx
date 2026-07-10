"use client";

import { formatPrice } from "@/lib/utils/format-price";
import { useCurrency } from "@/providers/CurrencyProvider";

interface PriceDisplayProps {
  price: number;
  comparePrice?: number | null;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { price: "0.9375rem", compare: "0.75rem" },
  md: { price: "1.25rem", compare: "0.875rem" },
  lg: { price: "1.75rem", compare: "1.0625rem" },
};

export function PriceDisplay({
  price,
  comparePrice,
  size = "md",
}: PriceDisplayProps) {
  const { currency, convert } = useCurrency();
  const isOnSale = comparePrice && comparePrice > price;

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span
        style={{
          fontSize: sizes[size].price,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: isOnSale ? "var(--color-danger)" : "var(--color-text)",
        }}
      >
        {formatPrice(convert(price), currency)}
      </span>
      {isOnSale && (
        <span
          style={{
            fontSize: sizes[size].compare,
            color: "var(--color-text-tertiary)",
            textDecoration: "line-through",
          }}
        >
          {formatPrice(convert(comparePrice), currency)}
        </span>
      )}
    </div>
  );
}
