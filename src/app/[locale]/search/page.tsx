"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";

export default function SearchPage() {
  const t = useTranslations("common");
  const nav = useTranslations("nav");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
        .then((res) => res.json())
        .then((d) => setResults(Array.isArray(d) ? d : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1rem 4rem" }}>
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("search") }]} />

      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "clamp(1.375rem, 4.5vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
          Search
        </h1>
        <div style={{ maxWidth: "32rem", margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-tertiary)" }}>
            <Search size={20} />
          </div>
          <input
            placeholder={nav("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "0.875rem 1rem 0.875rem 2.75rem",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-secondary)",
              color: "var(--color-text)",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <ProductGrid products={results} />
      ) : query.length >= 2 ? (
        <EmptyState title={t("noResults")} actionLabel={nav("catalog")} actionHref="/catalog" />
      ) : null}
    </div>
  );
}
