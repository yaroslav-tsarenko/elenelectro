"use client";

import { useTranslations } from "next-intl";
import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const promos = [
  { icon: <Truck size={22} />, titleKey: "promoFreeShipping" as const, descKey: "promoFreeShippingDesc" as const },
  { icon: <RotateCcw size={22} />, titleKey: "promoReturns" as const, descKey: "promoReturnsDesc" as const },
  { icon: <Headphones size={22} />, titleKey: "promoSupport" as const, descKey: "promoSupportDesc" as const },
  { icon: <ShieldCheck size={22} />, titleKey: "promoSecure" as const, descKey: "promoSecureDesc" as const },
];

export function PromoBar() {
  const t = useTranslations("home");

  return (
    <section className="px-4 py-12 bg-surface border-b border-line">
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {promos.map((promo, i) => (
          <motion.div
            key={promo.titleKey}
            className="flex items-center gap-4 p-4 rounded-xl bg-surface-1 border border-line transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center shrink-0 text-brand">
              {promo.icon}
            </div>
            <div>
              <p className="font-bold text-[0.8125rem] text-ink leading-[1.3]">{t(promo.titleKey)}</p>
              <p className="text-xs text-ink-muted mt-0.5">{t(promo.descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
