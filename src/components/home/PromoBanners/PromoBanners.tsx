"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

const banners = [
  {
    image: banner1,
    tag: "Professional Grade",
    title: "Switchgear & Distribution Boards",
    desc: "Certified panels, circuit breakers, and modular enclosures for residential and commercial installations.",
    href: "/catalog",
    cta: "Shop Switchgear",
    accent: "#4f46e5",
  },
  {
    image: banner2,
    tag: "Complete Range",
    title: "Industrial Control & Automation",
    desc: "From compact enclosures to full-size distribution cabinets — everything for your next project.",
    href: "/catalog",
    cta: "Browse Equipment",
    accent: "#0891b2",
  },
  {
    image: banner3,
    tag: "Top Quality",
    title: "Cables, Wiring & Connectors",
    desc: "Premium copper cables, flexible wiring, terminal blocks, and accessories at wholesale prices.",
    href: "/catalog",
    cta: "View Cables",
    accent: "#059669",
  },
];

export function PromoBanners() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((b, i) => (
          <motion.div
            key={i}
            className="group relative rounded-[10px] overflow-hidden bg-surface border border-line flex flex-col transition-all hover:shadow-[0_8px_28px_rgba(15,23,42,0.1)] hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="relative w-full aspect-[2.4/1] overflow-hidden">
              <Image
                src={b.image}
                alt={b.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_40%,rgba(0,0,0,0.04)_100%)]" />
            </div>
            <div className="px-5 pt-4 pb-5 flex flex-col gap-2">
              <span
                className="self-start text-[0.65rem] font-bold uppercase tracking-[0.04em] text-white px-2 py-[3px] rounded"
                style={{ background: b.accent }}
              >
                {b.tag}
              </span>
              <h3 className="text-[0.95rem] font-bold text-ink leading-[1.3] m-0">{b.title}</h3>
              <p className="text-[0.8rem] text-ink-muted leading-[1.5] m-0 line-clamp-3">{b.desc}</p>
              <Link
                href={b.href}
                className="inline-flex items-center gap-1 text-[0.8rem] font-semibold mt-1 transition-all hover:gap-2"
                style={{ color: b.accent }}
              >
                {b.cta} <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
