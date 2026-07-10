"use client";

import { useTranslations } from "next-intl";

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const t = useTranslations("product");

  const options = [
    { key: "newest", label: t("newest") },
    { key: "price-asc", label: t("priceLowHigh") },
    { key: "price-desc", label: t("priceHighLow") },
    { key: "name-asc", label: t("nameAZ") },
  ];

  return (
    <div style={{ maxWidth: "200px" }}>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>
        {t("sortBy")}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", fontSize: "0.875rem" }}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
