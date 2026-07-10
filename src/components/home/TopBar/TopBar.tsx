"use client";

import { Link } from "@/i18n/routing";
import { MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package,
};

interface UtilityLink {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface Props {
  links: UtilityLink[];
}

const defaultLinks: UtilityLink[] = [
  { id: "1", label: "About", linkUrl: "/about", position: "left" },
  { id: "2", label: "Payment", linkUrl: "/policies/payment", position: "left" },
  { id: "3", label: "Delivery", linkUrl: "/policies/shipping", position: "left" },
  { id: "4", label: "Returns", linkUrl: "/policies/returns", position: "left" },
  { id: "5", label: "Warranty", linkUrl: "/policies/warranty", position: "left" },
  { id: "7", label: "Contacts", linkUrl: "/contact", icon: "Phone", position: "right" },
];

const linkCls =
  "text-white/70 hover:text-white no-underline flex items-center gap-1 transition-colors whitespace-nowrap";

export function TopBar({ links }: Props) {
  const items = links.length > 0 ? links : defaultLinks;
  const leftLinks = items.filter((l) => l.position === "left");
  const rightLinks = items.filter((l) => l.position === "right");

  return (
    <div className="hidden md:block bg-[#0f172a] text-white/80 text-xs border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center h-8">
        <nav className="flex items-center gap-4">
          {leftLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link key={link.id} href={link.linkUrl} className={linkCls}>
                {Icon && <Icon size={13} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          {rightLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link key={link.id} href={link.linkUrl} className={linkCls}>
                {Icon && <Icon size={13} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
