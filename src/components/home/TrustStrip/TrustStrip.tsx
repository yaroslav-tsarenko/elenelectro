"use client";

import { useRef } from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { motion, useInView } from "framer-motion";

const items = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over €100", color: "rgba(79, 112, 255, 0.12)", iconColor: "#1B4DFF" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected checkout", color: "rgba(27, 77, 255, 0.12)", iconColor: "#1B4DFF" },
  { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy", color: "rgba(0, 212, 224, 0.14)", iconColor: "#d97706" },
  { icon: Headphones, label: "24/7 Support", desc: "We're always here to help", color: "rgba(6, 182, 212, 0.14)", iconColor: "#0891b2" },
];

export function TrustStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <section
      ref={ref}
      className="mb-6 rounded-lg bg-surface border border-line px-6 py-5 grid grid-cols-1 max-md:grid-cols-1 md:grid-cols-4 [@media(max-width:768px)_and_(min-width:481px)]:grid-cols-2 gap-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="flex items-center gap-3 py-2 max-sm:border-b max-sm:border-line max-sm:pb-3 max-sm:last:border-b-0 max-sm:last:pb-0 [@media(min-width:481px)]:[&:not(:last-child)]:border-r [@media(min-width:481px)]:[&:not(:last-child)]:border-line [@media(min-width:481px)]:[&:not(:last-child)]:pr-4 [@media(max-width:768px)_and_(min-width:481px)]:nth-2:!border-r-0"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <motion.div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: item.color }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <item.icon size={20} style={{ color: item.iconColor }} />
          </motion.div>
          <div>
            <p className="text-[0.8125rem] font-bold text-ink m-0 mb-0.5 leading-[1.2]">{item.label}</p>
            <p className="text-[0.7rem] text-ink-subtle m-0 leading-[1.3]">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
