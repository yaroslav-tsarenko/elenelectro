"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

interface SlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
}

interface DealData {
  id: string;
  title: string;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
}

interface DefaultSlide {
  id: string;
  badgeText: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  bgImage: StaticImageData;
}

const defaultSlides: DefaultSlide[] = [
  {
    id: "1",
    badgeText: "Professional Grade",
    title: "Switchgear & Distribution Boards",
    subtitle: "Certified panels, circuit breakers, and modular enclosures for residential and commercial installations",
    ctaLabel: "Shop Now",
    linkUrl: "/catalog",
    bgColor: "#0f172a",
    textColor: "#ffffff",
    bgImage: banner1,
  },
  {
    id: "2",
    badgeText: "Complete Range",
    title: "Industrial Control & Automation",
    subtitle: "From compact enclosures to full-size distribution cabinets — everything for your next project",
    ctaLabel: "Browse Equipment",
    linkUrl: "/catalog",
    bgColor: "#1e293b",
    textColor: "#ffffff",
    bgImage: banner2,
  },
  {
    id: "3",
    badgeText: "Top Quality",
    title: "Cables, Wiring & Connectors",
    subtitle: "Premium copper cables, flexible wiring, terminal blocks and accessories at wholesale prices",
    ctaLabel: "View Cables",
    linkUrl: "/catalog",
    bgColor: "#0B1530",
    textColor: "#ffffff",
    bgImage: banner3,
  },
];

const bgImageMap: Record<string, StaticImageData> = {
  "1": banner1,
  "2": banner2,
  "3": banner3,
};

interface Props {
  slides: SlideData[];
  deals: DealData[];
}

const arrowCls =
  "absolute top-1/2 -translate-y-1/2 bg-surface border border-line rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-ink z-[2] transition-colors hover:bg-white";

export function HeroCarousel({ slides, deals }: Props) {
  const useDefaults = slides.length === 0;
  const activeSlides = useDefaults ? defaultSlides : slides;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, activeSlides.length]);

  const slide = activeSlides[current];
  const bgImage = useDefaults
    ? (slide as DefaultSlide).bgImage
    : bgImageMap[slide.id] || null;

  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-1 relative rounded-[10px] overflow-hidden min-h-[320px] max-sm:min-h-[240px]">
        <div
          className="absolute inset-0 flex items-center transition-opacity duration-400"
          style={bgImage ? { color: "#fff" } : { background: slide.bgColor, color: slide.textColor }}
        >
          {bgImage && (
            <>
              <Image
                src={bgImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 75vw"
                className="object-cover [object-position:center_right] z-0"
                priority={current === 0}
              />
              <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(15,23,42,0.65)_0%,rgba(15,23,42,0.35)_50%,rgba(15,23,42,0.05)_100%)]" />
            </>
          )}
          <div className="relative z-[2] p-10 max-sm:p-6 max-w-[500px]">
            {slide.badgeText && (
              <span className="inline-block px-3 py-1 rounded bg-brand text-white text-[0.7rem] font-bold uppercase tracking-[0.05em] mb-4">
                {slide.badgeText}
              </span>
            )}
            <h2 className="text-[1.75rem] max-sm:text-xl font-extrabold leading-[1.15] m-0 mb-3 tracking-[-0.02em]">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-[0.9375rem] opacity-85 m-0 mb-6 leading-[1.5]">{slide.subtitle}</p>
            )}
            {slide.linkUrl && (
              <Link
                href={slide.linkUrl}
                className="inline-block px-6 py-2.5 rounded-md text-white no-underline text-sm font-semibold transition-opacity bg-brand hover:opacity-90"
              >
                {slide.ctaLabel || "Shop Now"}
              </Link>
            )}
          </div>
        </div>

        {activeSlides.length > 1 && (
          <>
            <button className={`${arrowCls} left-3`} onClick={prev} aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button className={`${arrowCls} right-3`} onClick={next} aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-[2]">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full border-0 cursor-pointer transition-all ${
                    i === current ? "bg-white w-5 rounded" : "bg-white/40 w-2"
                  }`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {deals.length > 0 && (
        <div className="hidden lg:flex flex-col gap-3 w-[220px] shrink-0">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={deal.linkUrl || "/catalog"}
              className="flex-1 bg-surface border border-line rounded-lg p-4 no-underline text-ink flex flex-col relative transition-all hover:border-line-hover hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
            >
              {deal.discountText && (
                <span className="absolute top-2 right-2 bg-sale text-white text-[0.7rem] font-bold px-1.5 py-0.5 rounded">
                  {deal.discountText}
                </span>
              )}
              <div className="flex justify-center mb-3">
                {deal.imageUrl ? (
                  <img src={deal.imageUrl} alt={deal.title} className="w-20 h-20 object-contain rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-surface-2 rounded-lg" />
                )}
              </div>
              <h4 className="text-[0.8125rem] font-semibold m-0 mb-2 leading-[1.3]">{deal.title}</h4>
              <div className="flex items-center gap-2 mt-auto">
                {deal.oldPrice && <span className="text-xs text-ink-subtle line-through">{deal.oldPrice}</span>}
                {deal.newPrice && <span className="text-[0.9375rem] font-bold text-sale">{deal.newPrice}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
