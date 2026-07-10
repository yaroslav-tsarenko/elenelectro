"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";

interface CartToastProps {
  name: string;
  imageUrl?: string | null;
  quantity: number;
}

export function CartToast({ name, imageUrl, quantity }: CartToastProps) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 min-w-[280px]"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center shrink-0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 400 }}
      >
        <Check size={14} strokeWidth={3} />
      </motion.div>

      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-1 shrink-0 flex items-center justify-center text-ink-subtle">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="48px" style={{ objectFit: "contain" }} />
        ) : (
          <ShoppingCart size={20} />
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-bold text-success uppercase tracking-[0.04em]">Added to cart</span>
        <span className="text-[0.8125rem] font-semibold text-ink whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
          {name}
        </span>
        {quantity > 1 && <span className="text-[0.6875rem] text-ink-subtle">Qty: {quantity}</span>}
      </div>
    </motion.div>
  );
}
