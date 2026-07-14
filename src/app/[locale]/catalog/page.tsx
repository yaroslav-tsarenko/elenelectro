"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort/ProductSort";
import { ProductSkeleton } from "@/components/product/ProductSkeleton/ProductSkeleton";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { cachedFetchJSON, readCached } from "@/lib/utils/reliable-fetch";

export default function CatalogPage() {
  const t = useTranslations("product");
  const nav = useTranslations("nav");
  const searchParams = useSearchParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>(() => {
    const cached = readCached<{ data: any[] }>({ cacheKey: "catalog:last", storage: "session" });
    return cached?.data || [];
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>(() => {
    return readCached<any[]>({ cacheKey: "catalog:categories", storage: "session" }) || [];
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>(() => {
    return readCached<string[]>({ cacheKey: "catalog:brands", storage: "session" }) || [];
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("onSale") === "true";
  const selectedBrand = searchParams.get("brand") || "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.page === undefined && !updates.page) params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    cachedFetchJSON<unknown>("/api/categories", { cacheKey: "catalog:categories", storage: "session" })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
    cachedFetchJSON<unknown>("/api/products/brands", { cacheKey: "catalog:brands", storage: "session" })
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sort", sort);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (onSale) params.set("onSale", "true");
    if (selectedBrand) params.set("brand", selectedBrand);

    const key = `catalog:products:${params.toString()}`;
    const cached = readCached<{ data: unknown[]; total: number; totalPages: number }>({
      cacheKey: key,
      storage: "session",
      ttlMs: 5 * 60 * 1000,
    });
    if (cached) {
      setProducts(cached.data || []);
      setTotal(cached.total || 0);
      setTotalPages(cached.totalPages || 1);
      setLoading(false);
    } else {
      setLoading(true);
    }

    cachedFetchJSON<{ data: unknown[]; total: number; totalPages: number }>(
      `/api/products?${params}`,
      { cacheKey: key, storage: "session" },
    )
      .then((data) => {
        setProducts(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sort, category, minPrice, maxPrice, inStock, onSale, selectedBrand]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const activeFilterCount = [category, minPrice, maxPrice, inStock, onSale, selectedBrand].filter(Boolean).length;

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs
        items={[
          { label: nav("home"), href: "/" },
          { label: nav("catalog") },
        ]}
      />

      <div className="flex justify-between items-end mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[1.75rem] max-[480px]:text-[1.375rem] font-extrabold tracking-[-0.03em]">{nav("catalog")}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {t("showing", { count: products.length, total })}
          </p>
        </div>
        <div className="flex items-center gap-3 max-[480px]:w-full max-[480px]:justify-between max-[480px]:gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="hidden max-lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-line bg-surface cursor-pointer text-[0.8125rem] font-semibold text-ink-muted hover:border-brand hover:text-brand"
            type="button"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-brand text-white rounded-pill px-1.5 py-px text-[0.6875rem] font-bold">{activeFilterCount}</span>
            )}
          </button>
          <ProductSort value={sort} onChange={(v) => updateParams({ sort: v, page: "1" })} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-8">
        <aside className="hidden lg:block sticky top-[calc(var(--header-height)+var(--announcement-height)+1rem)] self-start">
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            onSale={onSale}
            brands={brands}
            selectedBrand={selectedBrand}
            onCategoryChange={(v) => updateParams({ category: v, page: "1" })}
            onMinPriceChange={(v) => updateParams({ minPrice: v, page: "1" })}
            onMaxPriceChange={(v) => updateParams({ maxPrice: v, page: "1" })}
            onInStockChange={(v) => updateParams({ inStock: v ? "true" : "", page: "1" })}
            onSaleChange={(v) => updateParams({ onSale: v ? "true" : "", page: "1" })}
            onBrandChange={(v) => updateParams({ brand: v, page: "1" })}
          />
        </aside>

        <div className="min-w-0">
          {loading ? (
            <ProductSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              title={t("filterBy")}
              subtitle={t("priceRange")}
              actionLabel={nav("home")}
              actionHref="/"
            />
          ) : (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-10 pb-12 flex-wrap">
                  <button
                    onClick={() => updateParams({ page: String(page - 1) })}
                    disabled={page <= 1}
                    className={`w-9 h-9 rounded-lg border border-line bg-surface text-ink cursor-pointer text-[0.8125rem] font-medium flex items-center justify-center px-4 !w-auto h-9 ${page <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push("ellipsis-start");
                      const start = Math.max(2, page - 1);
                      const end = Math.min(totalPages - 1, page + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("ellipsis-end");
                      pages.push(totalPages);
                    }
                    return pages.map((p) =>
                      typeof p === "string" ? (
                        <span key={p} className="w-9 h-9 flex items-center justify-center text-[0.8125rem] text-ink-muted">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => updateParams({ page: String(p) })}
                          className={`w-9 h-9 rounded-lg border border-line bg-surface text-ink cursor-pointer text-[0.8125rem] font-medium flex items-center justify-center ${p === page ? "bg-brand !border-0 text-white font-bold" : ""}`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                  <button
                    onClick={() => updateParams({ page: String(page + 1) })}
                    disabled={page >= totalPages}
                    className={`w-9 h-9 rounded-lg border border-line bg-surface text-ink cursor-pointer text-[0.8125rem] font-medium flex items-center justify-center px-4 !w-auto h-9 ${page >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-surface rounded-t-2xl overflow-auto p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border-0 bg-surface-2 cursor-pointer text-ink"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
              onSale={onSale}
              brands={brands}
              selectedBrand={selectedBrand}
              onCategoryChange={(v) => { updateParams({ category: v, page: "1" }); setMobileFiltersOpen(false); }}
              onMinPriceChange={(v) => updateParams({ minPrice: v, page: "1" })}
              onMaxPriceChange={(v) => updateParams({ maxPrice: v, page: "1" })}
              onInStockChange={(v) => updateParams({ inStock: v ? "true" : "", page: "1" })}
              onSaleChange={(v) => updateParams({ onSale: v ? "true" : "", page: "1" })}
              onBrandChange={(v) => { updateParams({ brand: v, page: "1" }); setMobileFiltersOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
