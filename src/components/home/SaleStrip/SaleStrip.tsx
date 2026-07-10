"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  products: HomepageProduct[];
}

const arrowCls =
  "w-7 h-7 flex items-center justify-center border border-line rounded-md bg-surface cursor-pointer text-ink-muted transition-colors hover:border-line-hover hover:text-ink";

export function SaleStrip({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-40px" });

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section ref={sectionRef} className="mb-6 bg-surface border border-line rounded-lg px-5 py-4">
      <motion.div
        className="flex items-center justify-between mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={isInView ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
          >
            <Flame size={18} className="text-sale" />
          </motion.div>
          <h2 className="text-base font-extrabold m-0 text-ink">Hot Deals</h2>
          <span className="bg-sale text-white text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase">Sale</span>
        </div>
        <div className="flex gap-2 items-center">
          <Link
            href="/catalog?sort=price-asc&onSale=true"
            className="text-[0.8125rem] font-semibold text-sale no-underline flex items-center gap-0.5 whitespace-nowrap hover:opacity-80"
          >
            View all <ChevronRight size={14} />
          </Link>
          <div className="flex gap-1">
            <button className={arrowCls} onClick={() => scroll(-1)} aria-label="Scroll left">
              <ChevronLeft size={16} />
            </button>
            <button className={arrowCls} onClick={() => scroll(1)} aria-label="Scroll right">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
      <div className="relative">
        <div
          className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth pb-1"
          ref={scrollRef}
        >
          {products.map((p, i) => {
            const discount = getDiscountPercent(p);
            const imgUrl = getProductImage(p.images?.[0]?.url, p.name);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="shrink-0 w-40 max-[480px]:w-[140px] bg-surface border border-line rounded-lg p-3 no-underline text-ink flex flex-col relative transition-all hover:border-line-hover hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                >
                  {discount > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-sale text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded z-[1]">
                      -{discount}%
                    </span>
                  )}
                  <div className="flex justify-center items-center h-[100px] max-[480px]:h-20 mb-2 relative">
                    <Image
                      src={imgUrl}
                      alt={p.name}
                      width={120}
                      height={100}
                      className="object-contain max-w-full max-h-full rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getProductImageFallback("120x100");
                      }}
                    />
                  </div>
                  <h4 className="text-xs font-semibold leading-[1.3] line-clamp-2 m-0 mb-1.5 min-h-[2.6em]">
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-auto">
                    <span className="text-[0.9375rem] font-extrabold text-sale">
                      {formatPrice(Number(p.price))}
                    </span>
                    {p.comparePrice && (
                      <span className="text-[0.7rem] text-ink-subtle line-through">
                        {formatPrice(Number(p.comparePrice))}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
