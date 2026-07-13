"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";
import { Package } from "lucide-react";

const COLORS = [
  "rgba(27,77,255,0.12)",
  "rgba(6,182,212,0.12)",
  "rgba(79,112,255,0.14)",
  "rgba(0,212,224,0.14)",
  "rgba(244,63,94,0.12)",
  "rgba(124,58,237,0.14)",
  "rgba(59,130,246,0.14)",
  "rgba(236,72,153,0.12)",
];

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  categories: CategoryItem[];
}

export function CategoryShowcase({ categories }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  if (categories.length === 0) return null;

  return (
    <section ref={ref} className="mb-6">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-[1.125rem] font-extrabold m-0 text-ink">Shop by Category</h2>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Link
              href={`/catalog/${cat.slug}`}
              className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-3.5 max-[480px]:px-3 max-[480px]:py-2.5 no-underline text-ink transition-all hover:border-line-hover hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
            >
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 text-brand"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                <Package size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[0.8125rem] font-bold m-0 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  {cat.name}
                </h3>
                <span className="text-[0.7rem] text-ink-subtle">{cat.productCount} products</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
