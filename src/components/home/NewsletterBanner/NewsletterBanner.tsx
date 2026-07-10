"use client";

import { useState, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { motion, useInView } from "framer-motion";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <motion.section
      ref={ref}
      className="mb-6 rounded-lg bg-brand text-white p-8 max-md:p-6 max-md:text-center flex flex-col md:flex-row items-center max-md:items-stretch justify-between gap-8 relative overflow-hidden before:content-[''] before:absolute before:-top-[40%] before:-right-[10%] before:w-[300px] before:h-[300px] before:bg-white/10 before:rounded-full before:pointer-events-none after:content-[''] after:absolute after:-bottom-[50%] after:left-[10%] after:w-[200px] after:h-[200px] after:bg-white/5 after:rounded-full after:pointer-events-none"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex-1 relative z-[1]"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2.5 max-md:justify-center">
          <motion.div
            className="w-[52px] h-[52px] bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center leading-none shrink-0"
            animate={isInView ? { rotate: [0, -8, 8, -4, 0] } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="text-xl font-black">10%</span>
            <span className="text-[0.5rem] font-bold uppercase tracking-[0.05em]">OFF</span>
          </motion.div>
          <div>
            <h2 className="text-xl font-extrabold m-0 leading-[1.2]">Subscribe &amp; Save 10%</h2>
            <p className="text-[0.8125rem] opacity-85 mt-1.5 leading-[1.5]">
              Get exclusive deals, new arrivals &amp; special offers straight to your inbox.
            </p>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="flex gap-2 relative z-[1] shrink-0 max-md:w-full max-md:flex-col"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {submitted ? (
          <motion.span
            className="text-sm font-semibold flex items-center gap-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle size={18} /> You&apos;re in! Check your inbox.
          </motion.span>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-md:flex-col max-md:w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-4 py-3 rounded-lg border-2 border-white/25 bg-white/15 backdrop-blur-sm text-white text-sm w-[260px] max-md:w-full outline-none transition-colors placeholder:text-white/60 focus:border-white/50"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg border-0 bg-white text-brand text-sm font-bold cursor-pointer transition-all whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
            >
              Subscribe
            </button>
          </form>
        )}
      </motion.div>
    </motion.section>
  );
}
