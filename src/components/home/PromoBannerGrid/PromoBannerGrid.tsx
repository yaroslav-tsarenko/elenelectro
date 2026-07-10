"use client";

import { Link } from "@/i18n/routing";

interface BannerData {
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

interface Props {
  smallBanners: BannerData[];
  wideBanners: BannerData[];
}

const defaultSmall: BannerData[] = [
  { id: "1", badgeText: "Circuit Breakers", title: "Protect Every Circuit", subtitle: "From €12.99", bgColor: "var(--promo-bg-blue)", textColor: "var(--color-text)", linkUrl: "/catalog/smart-modular-circuit-breakers" },
  { id: "2", badgeText: "Cables & Wiring", title: "Premium Copper Cables", subtitle: "Up to 30% off", bgColor: "var(--promo-bg-warm)", textColor: "var(--color-text)", linkUrl: "/catalog/installation-and-wiring-materials" },
  { id: "3", badgeText: "LED Lighting", title: "Illuminate Your Space", subtitle: "From €4.99", bgColor: "var(--promo-bg-green)", textColor: "var(--color-text)", linkUrl: "/catalog/lighting" },
];

const defaultWide: BannerData[] = [
  { id: "w1", badgeText: "Pro Account", title: "Register & Get 10% Off Your First Order", subtitle: "Free shipping over €100, trade pricing, and priority support", bgColor: "#0f172a", textColor: "#ffffff", linkUrl: "/auth/register", ctaLabel: "Join Free" },
];

export function PromoBannerGrid({ smallBanners, wideBanners }: Props) {
  const small = smallBanners.length > 0 ? smallBanners : defaultSmall;
  const wide = wideBanners.length > 0 ? wideBanners : defaultWide;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {small.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {small.map((b) => (
            <Link
              key={b.id}
              href={b.linkUrl || "#"}
              className="flex flex-col p-5 rounded-lg no-underline border border-line transition-all hover:shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:-translate-y-px"
              style={{ background: b.bgColor, color: b.textColor }}
            >
              {b.badgeText && (
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.05em] mb-1.5">{b.badgeText}</span>
              )}
              <h3 className="text-base font-bold m-0 mb-1 leading-[1.25]">{b.title}</h3>
              {b.subtitle && (
                <span className="text-[0.8125rem] text-ink-muted mb-3">{b.subtitle}</span>
              )}
              <span className="text-[0.8125rem] font-semibold mt-auto">Shop now →</span>
            </Link>
          ))}
        </div>
      )}
      {wide.map((b) => (
        <Link
          key={b.id}
          href={b.linkUrl || "#"}
          className="flex flex-col md:flex-row items-center md:justify-between px-8 py-6 max-md:px-5 max-md:py-5 max-md:text-center rounded-lg no-underline transition-opacity gap-4 md:gap-8 hover:opacity-95"
          style={{ background: b.bgColor, color: b.textColor }}
        >
          <div className="flex-1">
            {b.badgeText && (
              <span className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-[0.05em] text-white bg-brand mb-2">
                {b.badgeText}
              </span>
            )}
            <h3 className="text-xl font-extrabold m-0 mb-1.5 text-inherit">{b.title}</h3>
            {b.subtitle && <p className="text-[0.8125rem] opacity-70 m-0">{b.subtitle}</p>}
          </div>
          {b.ctaLabel && (
            <span className="px-6 py-2.5 rounded-md bg-brand text-white text-sm font-semibold shrink-0">
              {b.ctaLabel}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
