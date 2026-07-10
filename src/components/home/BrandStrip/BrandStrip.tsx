"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

interface Props {
  brands: BrandData[];
}

const arrowCls =
  "w-7 h-7 flex items-center justify-center border border-line rounded-md bg-surface cursor-pointer text-ink-muted transition-colors hover:border-line-hover hover:text-ink";

export function BrandStrip({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (!brands.length) return null;

  return (
    <div className="bg-surface border border-line rounded-lg px-5 py-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.9375rem] font-bold m-0 text-ink">Popular Brands</h3>
        <div className="flex gap-1">
          <button className={arrowCls} onClick={() => scroll(-1)} aria-label="Scroll left">
            <ChevronLeft size={16} />
          </button>
          <button className={arrowCls} onClick={() => scroll(1)} aria-label="Scroll right">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        ref={scrollRef}
      >
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={brand.linkUrl || "#"}
            className="shrink-0 flex items-center justify-center px-5 py-2.5 border border-line rounded-md bg-surface-1 min-w-[100px] transition-colors cursor-pointer hover:border-line-hover hover:bg-surface-2"
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="max-h-6 max-w-20 object-contain" />
            ) : (
              <span className="text-[0.8125rem] font-semibold text-ink-muted whitespace-nowrap">{brand.name}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
