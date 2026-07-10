import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

/*
 * Tailwind v4 primarily consumes design tokens through the @theme block in
 * globals.css. This config keeps the plugin surface (HeroUI, dark-mode class)
 * and exposes the same tokens for any consumer that still expects them via
 * `theme.extend.colors`.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      maxWidth: {
        container: "1320px",
        narrow: "1120px",
        wide: "1440px",
      },
      colors: {
        surface: {
          DEFAULT: "var(--color-bg)",
          1: "var(--color-bg-secondary)",
          2: "var(--color-bg-tertiary)",
          warm: "var(--color-bg-warm)",
        },
        ink: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-secondary)",
          subtle: "var(--color-text-tertiary)",
        },
        brand: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-light)",
          2: "var(--color-accent-2)",
        },
        sale: "var(--color-accent-3)",
        line: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
        },
        promo: {
          blue: "var(--promo-bg-blue)",
          warm: "var(--promo-bg-warm)",
          green: "var(--promo-bg-green)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        accent: "var(--shadow-accent)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        pill: "var(--radius-pill)",
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-accent)",
        "gradient-warm": "var(--gradient-warm)",
        "gradient-cool": "var(--gradient-cool)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-badge": "var(--gradient-badge)",
      },
    },
  },
  plugins: [heroui()],
};

export default config;
