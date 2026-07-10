"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const cardCls =
  "group relative block rounded-2xl overflow-hidden min-h-[260px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-xl)]";
const cardContentCls =
  "relative z-[1] p-10 text-white flex flex-col h-full min-h-[260px] justify-end";
const cardCtaCls =
  "inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-pill w-fit transition-all group-hover:bg-white/30 group-hover:gap-3";

export function PromoBanner() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/catalog?onSale=true" className={cardCls}>
              <div className="absolute inset-0 bg-brand" />
              <div className={cardContentCls}>
                <span className="text-xs font-bold uppercase tracking-[0.08em] opacity-80 mb-2">Limited Offer</span>
                <h3 className="text-3xl font-extrabold tracking-[-0.03em] mb-2">Up to 40% off</h3>
                <p className="text-[0.9375rem] opacity-85 mb-5 max-w-[280px] leading-[1.5]">
                  Don&apos;t miss our biggest sale of the season
                </p>
                <span className={cardCtaCls}>
                  Shop now <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/catalog?sort=newest" className={cardCls}>
              <div className="absolute inset-0 bg-brand-2" />
              <div className={cardContentCls}>
                <span className="text-xs font-bold uppercase tracking-[0.08em] opacity-80 mb-2">Just Arrived</span>
                <h3 className="text-3xl font-extrabold tracking-[-0.03em] mb-2">New Collection</h3>
                <p className="text-[0.9375rem] opacity-85 mb-5 max-w-[280px] leading-[1.5]">
                  Explore the latest trends and must-have items
                </p>
                <span className={cardCtaCls}>
                  Explore <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
