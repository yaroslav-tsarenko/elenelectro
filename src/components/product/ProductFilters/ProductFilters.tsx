"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  selectedBrand: string;
  onCategoryChange: (slug: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onSaleChange: (value: boolean) => void;
  onBrandChange: (value: string) => void;
}

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-b-0">
      <button className="flex items-center justify-between w-full px-5 py-4 bg-transparent border-0 cursor-pointer text-ink-muted transition-colors hover:bg-surface-2" onClick={() => setOpen(!open)}>
        <h3 className="text-[0.8125rem] font-bold uppercase tracking-[0.05em] text-ink">{title}</h3>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function CategoryItem({
  cat,
  depth,
  selectedCategory,
  onCategoryChange,
}: {
  cat: Category;
  depth: number;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children && cat.children.length > 0;
  const isActive = selectedCategory === cat.slug;
  const count = cat._count?.products || 0;

  return (
    <>
      <li
        className={`text-sm text-ink-muted px-2.5 py-2 rounded-md cursor-pointer transition-colors ${isActive ? "bg-brand-soft text-brand font-semibold" : "hover:bg-surface-2 hover:text-ink"}`}
        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
      >
        <span
          onClick={() => onCategoryChange(cat.slug)}
          style={{ flex: 1, cursor: "pointer" }}
        >
          {cat.name}
          {count > 0 && (
            <span style={{ color: "var(--color-text-tertiary)", fontSize: "0.75rem", marginLeft: "0.25rem" }}>
              ({count})
            </span>
          )}
        </span>
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-tertiary)", padding: "0.125rem", display: "flex",
            }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </li>
      {hasChildren && expanded && cat.children!.map((child) => (
        <CategoryItem
          key={child.id}
          cat={child}
          depth={depth + 1}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </>
  );
}

export function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  inStock,
  onSale,
  brands,
  selectedBrand,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onSaleChange,
  onBrandChange,
}: ProductFiltersProps) {
  const t = useTranslations("product");
  const nav = useTranslations("nav");

  return (
    <aside className="flex flex-col gap-0 bg-surface border border-line rounded-xl overflow-hidden">
      <FilterSection title={t("filterBy")}>
        {categories.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-2">
                <div className="h-3 rounded-md bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer" style={{ width: `${50 + (i * 19) % 40}%`, flex: 1 }} />
                <div className="h-3 rounded-md bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer" style={{ width: "20px" }} />
              </div>
            ))}
          </div>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
            <li
              className={`text-sm text-ink-muted px-2.5 py-2 rounded-md cursor-pointer transition-colors ${!selectedCategory ? "bg-brand-soft text-brand font-semibold" : "hover:bg-surface-2 hover:text-ink"}`}
              onClick={() => onCategoryChange("")}
            >
              {nav("allCategories")}
            </li>
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                depth={0}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </ul>
        )}
      </FilterSection>

      <FilterSection title={t("priceRange")}>
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-ink text-sm transition-colors focus:outline-none focus:border-brand"
          />
          <span className="text-ink-subtle shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-ink text-sm transition-colors focus:outline-none focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button className="px-1 py-1.5 text-xs rounded-md border border-line bg-surface text-ink-muted cursor-pointer transition-all font-medium hover:bg-brand-soft hover:text-brand hover:border-brand" onClick={() => { onMinPriceChange(""); onMaxPriceChange("25"); }}>Under €25</button>
          <button className="px-1 py-1.5 text-xs rounded-md border border-line bg-surface text-ink-muted cursor-pointer transition-all font-medium hover:bg-brand-soft hover:text-brand hover:border-brand" onClick={() => { onMinPriceChange("25"); onMaxPriceChange("50"); }}>€25–€50</button>
          <button className="px-1 py-1.5 text-xs rounded-md border border-line bg-surface text-ink-muted cursor-pointer transition-all font-medium hover:bg-brand-soft hover:text-brand hover:border-brand" onClick={() => { onMinPriceChange("50"); onMaxPriceChange("100"); }}>€50–€100</button>
          <button className="px-1 py-1.5 text-xs rounded-md border border-line bg-surface text-ink-muted cursor-pointer transition-all font-medium hover:bg-brand-soft hover:text-brand hover:border-brand" onClick={() => { onMinPriceChange("100"); onMaxPriceChange(""); }}>€100+</button>
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <ul className="list-none p-0 m-0 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
            <li
              className={`text-sm text-ink-muted px-2.5 py-2 rounded-md cursor-pointer transition-colors ${!selectedBrand ? "bg-brand-soft text-brand font-semibold" : "hover:bg-surface-2 hover:text-ink"}`}
              onClick={() => onBrandChange("")}
            >
              All Brands
            </li>
            {brands.map((brand) => (
              <li
                key={brand}
                className={`text-sm text-ink-muted px-2.5 py-2 rounded-md cursor-pointer transition-colors ${selectedBrand === brand ? "bg-brand-soft text-brand font-semibold" : "hover:bg-surface-2 hover:text-ink"}`}
                onClick={() => onBrandChange(brand)}
              >
                {brand}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      <FilterSection title={t("availability")} defaultOpen={false}>
        <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer py-1.5 [&_input[type=checkbox]]:accent-brand [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:h-4">
          <input type="checkbox" checked={inStock} onChange={(e) => onInStockChange(e.target.checked)} />
          <span>{t("inStock")}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer py-1.5 [&_input[type=checkbox]]:accent-brand [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:h-4">
          <input type="checkbox" checked={onSale} onChange={(e) => onSaleChange(e.target.checked)} />
          <span>On Sale</span>
        </label>
      </FilterSection>
    </aside>
  );
}
