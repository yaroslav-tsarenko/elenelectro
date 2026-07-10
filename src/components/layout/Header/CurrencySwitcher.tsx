"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted transition-colors no-underline hover:bg-surface-1 hover:text-ink"
        onClick={() => setOpen(!open)}
        aria-label="Currency"
        style={{ fontSize: "0.8125rem", fontWeight: 700, width: "auto", padding: "0 0.5rem" }}
      >
        {current.symbol}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.375rem",
            background: "var(--color-bg, #fff)",
            border: "1px solid var(--color-border, #e5e5e5)",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            zIndex: 60,
            minWidth: "120px",
            overflow: "hidden",
          }}
        >
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: c.code === currency ? 700 : 500,
                textAlign: "left",
                background: c.code === currency ? "var(--color-accent-light, #FFF0F0)" : "transparent",
                color: c.code === currency ? "var(--color-accent, #E53935)" : "var(--color-text, #333)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
