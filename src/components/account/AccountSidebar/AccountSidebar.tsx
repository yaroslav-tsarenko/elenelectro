"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/AuthProvider";
import { LayoutDashboard, Package, User, MapPin, Heart, LogOut } from "lucide-react";

const navItems = [
  { href: "/account", icon: <LayoutDashboard size={18} />, labelKey: "title" as const },
  { href: "/account/orders", icon: <Package size={18} />, labelKey: "orders" as const },
  { href: "/account/profile", icon: <User size={18} />, labelKey: "profile" as const },
  { href: "/account/addresses", icon: <MapPin size={18} />, labelKey: "addresses" as const },
  { href: "/account/wishlist", icon: <Heart size={18} />, labelKey: "wishlist" as const },
];

const linkBase =
  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors no-underline max-md:shrink-0 max-md:whitespace-nowrap max-md:px-3.5 max-md:py-2 max-md:text-[0.8125rem]";

export function AccountSidebar() {
  const pathname = usePathname();
  const t = useTranslations("account");
  const { user, signOut } = useAuth();

  return (
    <aside className="w-60 max-md:w-full bg-surface-1 border border-line rounded-lg py-6 max-md:py-4 flex flex-col h-fit sticky top-8 max-md:static">
      <div className="flex items-center gap-3 px-5 max-md:px-4 pb-5 max-md:pb-3 border-b border-line mb-3 max-md:mb-2">
        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-base shrink-0">
          {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm leading-[1.2]">{user?.name || "User"}</p>
          <p className="text-xs text-ink-subtle overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
            {user?.email}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 max-md:flex-row max-md:overflow-x-auto max-md:gap-1.5 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const isActive =
            pathname.endsWith(item.href) ||
            (item.href !== "/account" && pathname.includes(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkBase} ${
                isActive
                  ? "bg-surface-2 text-ink font-semibold"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
        <button
          className={`${linkBase} text-danger bg-transparent border-0 cursor-pointer w-full text-left mt-2 max-md:mt-0 hover:bg-surface-2`}
          onClick={signOut}
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </nav>
    </aside>
  );
}
