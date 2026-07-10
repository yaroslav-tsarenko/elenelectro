"use client";

import { useState, useMemo, useRef } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { MarketplaceProductCard } from "../MarketplaceProductCard/MarketplaceProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
  quantity?: number;
  status?: string;
  isFeatured?: boolean;
  brand?: string | null;
}

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tabs?: string[];
  bg?: "white" | "gray";
  columns?: number;
}

export function ProductSection({
  title, subtitle, products, viewAllHref, viewAllLabel, tabs, bg = "white", columns = 5,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const filtered = useMemo(() => {
    if (!tabs || tabs.length === 0 || activeTab === 0) return products;
    const tabName = tabs[activeTab];
    return products.filter((p) =>
      p.categories?.some((c) => c.category.name === tabName)
    );
  }, [products, tabs, activeTab]);

  if (!products.length) return null;

  return (
    <section
      ref={ref}
      className={`mb-6 ${bg === "gray" ? "bg-surface-1 rounded-lg p-5" : ""}`}
    >
      <motion.div
        className="flex items-center gap-4 mb-4 flex-wrap max-[480px]:flex-col max-[480px]:items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-baseline gap-2">
          <h2 className="text-[1.125rem] font-extrabold m-0 text-ink whitespace-nowrap">{title}</h2>
          {subtitle && <span className="text-xs text-ink-subtle whitespace-nowrap">{subtitle}</span>}
        </div>
        {tabs && tabs.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1 border rounded-[5px] text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  i === activeTab
                    ? "border-brand text-brand bg-brand-soft"
                    : "border-line bg-surface text-ink-muted hover:border-line-hover hover:text-ink"
                }`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="ml-auto max-[480px]:ml-0 text-[0.8125rem] font-semibold text-brand no-underline flex items-center gap-0.5 whitespace-nowrap transition-opacity hover:opacity-80"
          >
            {viewAllLabel || "View all"} <ChevronRight size={14} />
          </Link>
        )}
      </motion.div>
      <div
        className="grid gap-3 max-[1200px]:!grid-cols-4 max-[1024px]:!grid-cols-3 max-md:!grid-cols-2 max-[480px]:gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.5) }}
          >
            <MarketplaceProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
