"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="py-5 text-[0.8125rem]" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 list-none p-0 m-0 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight size={14} className="text-ink-subtle text-xs" />
            )}
            {item.href ? (
              <Link href={item.href} className="text-ink-muted transition-colors hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
