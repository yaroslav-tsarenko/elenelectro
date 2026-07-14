"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  lv: "LV",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted transition-colors no-underline hover:bg-surface-1 hover:text-ink"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
      >
        <Globe size={20} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            zIndex: 50,
            minWidth: "5rem",
          }}
        >
          {Object.entries(LOCALE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchLocale(key)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 1rem",
                textAlign: "left",
                fontSize: "0.875rem",
                fontWeight: key === locale ? 700 : 400,
                background: key === locale ? "var(--color-bg-tertiary)" : "transparent",
                color: "var(--color-text)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
