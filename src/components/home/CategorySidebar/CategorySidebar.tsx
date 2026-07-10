"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight, ChevronDown, Menu, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

const shimmerBarCls =
  "h-3 rounded-md bg-[linear-gradient(90deg,var(--color-bg-secondary)_25%,var(--color-bg-tertiary)_50%,var(--color-bg-secondary)_75%)] bg-[length:200%_100%] animate-shimmer";

function CategoryItem({ cat, depth = 0, onNavigate }: { cat: Category; depth?: number; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const count = cat._count?.products || 0;

  return (
    <>
      <div
        className="flex items-center border-b border-line last:border-b-0"
        style={{ paddingLeft: `${0.75 + depth * 0.75}rem` }}
      >
        <Link
          href={`/catalog/${cat.slug}`}
          className="flex items-center gap-2 flex-1 min-w-0 py-2 pr-1 no-underline text-ink text-[0.8125rem] transition-colors hover:text-brand"
          onClick={onNavigate}
        >
          <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{cat.name}</span>
          {count > 0 && <span className="text-[0.6875rem] text-ink-subtle shrink-0">{count}</span>}
        </Link>
        {hasChildren && (
          <button
            className="flex items-center justify-center w-7 h-7 bg-transparent border-0 cursor-pointer text-ink-subtle shrink-0 rounded transition-colors mr-1 hover:bg-surface-2 hover:text-ink"
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      {hasChildren && expanded && cat.children!.map((child) => (
        <CategoryItem key={child.id} cat={child} depth={depth + 1} onNavigate={onNavigate} />
      ))}
    </>
  );
}

export function CategorySidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        className="hidden max-lg:flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white border-0 rounded-lg text-sm font-semibold cursor-pointer"
        onClick={() => setMobileOpen(true)}
        aria-label="Open categories"
      >
        <Menu size={20} />
        <span>Categories</span>
      </button>

      {mobileOpen && (
        <div className="hidden max-lg:block fixed inset-0 bg-black/40 z-[999]" onClick={closeMobile} />
      )}

      <aside
        className={`w-60 bg-surface border border-line rounded-lg shrink-0 overflow-hidden h-fit max-lg:fixed max-lg:top-0 max-lg:w-[280px] max-lg:h-screen max-lg:z-[1000] max-lg:rounded-none max-lg:border-none max-lg:overflow-y-auto max-lg:transition-[left] max-lg:duration-[250ms] ${
          mobileOpen ? "max-lg:left-0" : "max-lg:-left-[300px]"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] text-white">
          <h3 className="flex items-center gap-2 text-sm font-bold m-0 uppercase tracking-[0.03em]">
            <Menu size={16} />
            Catalog
          </h3>
          <button
            className="hidden max-lg:block bg-transparent border-0 text-white cursor-pointer p-0.5"
            onClick={closeMobile}
            aria-label="Close categories"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col max-h-[70vh] overflow-y-auto">
          {categories.length === 0 ? (
            <div className="flex flex-col">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-line last:border-b-0">
                  <div className={shimmerBarCls} style={{ width: `${55 + (i * 17) % 35}%`, flexShrink: 0 }} />
                  <div className={shimmerBarCls} style={{ width: "24px", marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <CategoryItem key={cat.id} cat={cat} onNavigate={closeMobile} />
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
