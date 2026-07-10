"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery. Free shipping is offered on orders over €100.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy on all items. Products must be unused and in their original packaging. Contact our support team to initiate a return.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes! We ship to most countries worldwide. International shipping typically takes 7-14 business days depending on the destination.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order from your account dashboard.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, PayPal, and bank transfers. All payments are processed securely with SSL encryption.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we'll do our best to help.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Yes! Gift wrapping is available at checkout for a small additional fee. You can also include a personalized message with your gift.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach us via our contact form, email at support@store.com, or through live chat on our website. We're available 24/7 to help.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--color-border)",
      overflow: "hidden",
      background: open ? "var(--color-bg-secondary)" : "var(--color-bg)",
      transition: "background-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.125rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text)" }}>{q}</span>
        <ChevronDown
          size={18}
          style={{
            color: "var(--color-text-tertiary)",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 1.25rem 1.125rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1rem 4rem" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "0.75rem", wordBreak: "break-word" }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p style={{ fontSize: "clamp(0.875rem, 2.4vw, 1rem)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            Everything you need to know about shopping with us
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
