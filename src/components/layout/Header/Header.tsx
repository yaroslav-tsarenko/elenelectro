"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ShoppingCart, Search, Menu, X, User, Shield,
  ChevronRight, Heart, ChevronDown,
  Cable, LayoutGrid, Zap, Lightbulb, CircuitBoard, Plug,
  Box, Wrench, Shield as ShieldIcon, SquareStack,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { AvontLogo } from "../AvontLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

function subtreeCount(cat: Category): number {
  const own = cat._count?.products || 0;
  return own + (cat.children || []).reduce((s, c) => s + subtreeCount(c), 0);
}

const ICON_MAP: Record<string, React.ElementType> = {
  "wiring": Cable,
  "cable": Cable,
  "automation": CircuitBoard,
  "control": CircuitBoard,
  "distribution": LayoutGrid,
  "energy": Zap,
  "protection": ShieldIcon,
  "protective": ShieldIcon,
  "fuse": Zap,
  "lighting": Lightbulb,
  "light": Lightbulb,
  "terminal": SquareStack,
  "mounting": Box,
  "box": Box,
  "conduit": Wrench,
  "connector": Plug,
  "power": Zap,
  "plug": Plug,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  for (const [keyword, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return Icon;
  }
  return LayoutGrid;
}

const iconButtonCls =
  "relative flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted transition-colors no-underline hover:bg-surface-1 hover:text-ink";
const navLinkCls =
  "text-[0.8125rem] font-medium text-ink-muted transition-colors px-2.5 py-1.5 rounded-md flex items-center gap-1 whitespace-nowrap bg-transparent border-0 cursor-pointer hover:text-ink hover:bg-surface-1";
const drawerNavLinkCls =
  "text-[0.9375rem] font-medium text-ink py-3 px-3 rounded-md flex items-center justify-between transition-colors no-underline hover:bg-surface-1";
const drawerBtnCls =
  "flex items-center justify-center py-3 rounded-md font-semibold text-sm border-0 cursor-pointer";

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount, cartBounce } = useCart();
  const { user, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  const openMega = useCallback(() => {
    clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-[60px] border-b border-line bg-surface transition-shadow ${
          scrolled ? "shadow-[0_2px_8px_rgba(15,23,42,0.06)]" : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-full flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-[-0.04em] text-ink whitespace-nowrap flex items-center gap-[0.4rem] shrink-0 no-underline"
          >
            <AvontLogo size={24} />
            <span className="text-brand font-black">AvontShop</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            <Link href="/" className={navLinkCls}>
              {t("home")}
            </Link>

            <div
              className="relative"
              ref={megaRef}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <button className={navLinkCls} onClick={() => setMegaOpen(!megaOpen)}>
                {t("catalog")}
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s",
                    transform: megaOpen ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>
            </div>

            <Link href="/contact" className={navLinkCls}>
              {t("contact")}
            </Link>
          </nav>

          <form
            className="hidden md:flex flex-1 max-w-[500px] relative items-center h-[38px] border-2 border-brand rounded-lg overflow-hidden bg-surface"
            onSubmit={handleSearch}
          >
            <Search size={16} className="absolute left-2.5 text-ink-subtle pointer-events-none" />
            <input
              type="text"
              className="flex-1 h-full pl-8 pr-3 border-0 outline-none text-[0.8125rem] bg-transparent text-ink placeholder:text-ink-subtle"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="h-full px-5 bg-brand text-white border-0 text-[0.8125rem] font-semibold cursor-pointer transition-colors whitespace-nowrap hover:bg-brand-hover"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            <Link
              href="/search"
              className={`${iconButtonCls} flex md:hidden`}
              aria-label={t("search")}
            >
              <Search size={20} />
            </Link>

            <ThemeToggle />
            <CurrencySwitcher />

            {user && (
              <Link href="/account/wishlist" className={iconButtonCls} aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            )}

            <Link
              href="/cart"
              className={`${iconButtonCls} relative`}
              aria-label={t("cart")}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <motion.span
                  key={cartBounce}
                  className="absolute -top-[3px] -right-[3px] bg-brand text-white text-[0.625rem] font-bold min-w-[1.125rem] h-[1.125rem] flex items-center justify-center rounded-full px-1 border-2 border-surface"
                  initial={cartBounce > 0 ? { scale: 0.5 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 400 }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </Link>

            {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
              <a href="/admin" className={iconButtonCls} aria-label="Admin">
                <Shield size={20} />
              </a>
            )}

            {user ? (
              <Link href="/account" className={iconButtonCls} aria-label={t("account")}>
                <User size={20} />
              </Link>
            ) : (
              <Link href="/auth/login" className={iconButtonCls} aria-label={t("login")}>
                <User size={20} />
              </Link>
            )}

            <button
              className={`${iconButtonCls} flex lg:hidden`}
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {megaOpen && (
          <>
            <motion.div
              className="fixed inset-0 top-[60px] bg-black/45 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMegaOpen(false)}
            />
            <motion.div
              className="fixed top-[60px] left-0 right-0 z-[45] max-h-[30vh] overflow-y-auto bg-surface border-b border-line shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div className="max-w-[1400px] mx-auto px-6 pt-5 pb-4">
                {categories.length === 0 ? (
                  <div className="grid grid-cols-5 max-[1200px]:grid-cols-3 gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                        <div className="w-9 h-9 rounded-md bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div
                            className="h-2.5 rounded-[5px] bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer"
                            style={{ width: `${55 + (i * 17) % 35}%` }}
                          />
                          <div className="h-2.5 rounded-[5px] bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer w-[40%]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 max-[1200px]:grid-cols-3 gap-2">
                    {[...categories]
                      .sort((a, b) => subtreeCount(b) - subtreeCount(a))
                      .slice(0, 10)
                      .map((cat) => {
                        const Icon = getIconForCategory(cat.name);
                        const count = subtreeCount(cat);
                        return (
                          <Link
                            key={cat.id}
                            href={`/catalog/${cat.slug}`}
                            className="group flex items-center gap-3 px-3 py-2.5 rounded-md no-underline text-ink transition-colors hover:bg-surface-1"
                            onClick={() => setMegaOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-md bg-brand-soft flex items-center justify-center shrink-0 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                              <Icon size={20} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[0.8rem] font-semibold leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                                {cat.name}
                              </span>
                              <span className="text-[0.675rem] text-ink-subtle">
                                {count} products
                              </span>
                            </div>
                            <ChevronRight
                              size={14}
                              className="ml-auto shrink-0 text-line opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                            />
                          </Link>
                        );
                      })}
                  </div>
                )}
                <div className="mt-3 pt-2.5 border-t border-line flex items-center">
                  <Link
                    href="/catalog"
                    className="text-[0.8125rem] font-semibold text-brand flex items-center gap-1 no-underline transition-all hover:gap-2"
                    onClick={() => setMegaOpen(false)}
                  >
                    Browse all categories <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[min(85vw,380px)] bg-surface z-[100] flex flex-col shadow-[-4px_0_20px_rgba(15,23,42,0.08)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <span className="text-lg font-bold text-ink">Menu</span>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted hover:bg-surface-1 hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <nav className="flex flex-col gap-1">
                  <Link href="/" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("home")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("catalog")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?sort=newest" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    New Arrivals <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?onSale=true" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    Deals <ChevronRight size={18} />
                  </Link>

                  <div className="h-px bg-line my-2" />

                  <Link href="/contact" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("contact")} <ChevronRight size={18} />
                  </Link>
                  {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <a href="/admin" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                      Admin Panel <ChevronRight size={18} />
                    </a>
                  )}
                </nav>
              </div>

              <div className="px-5 py-4 border-t border-line flex flex-col gap-3">
                {user ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)}>
                    <div className={`${drawerBtnCls} bg-brand text-white`}>My Account</div>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <div className={`${drawerBtnCls} bg-brand text-white`}>Sign In</div>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <div className={`${drawerBtnCls} bg-surface-1 text-ink`}>Create Account</div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
