"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { AnimatedSection } from "@/components/shared/AnimatedSection/AnimatedSection";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  quantity: number;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string } }[];
}

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations("home");
  const common = useTranslations("common");

  if (products.length === 0) return null;

  return (
    <AnimatedSection>
      <section className="section-padding">
        <div className="section-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 className="section-title">{t("featured")}</h2>
              <p className="section-subtitle">Handpicked products just for you</p>
            </div>
            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-accent)",
                transition: "gap 0.2s",
              }}
            >
              {common("viewAll")} <ArrowRight size={16} />
            </Link>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </AnimatedSection>
  );
}
