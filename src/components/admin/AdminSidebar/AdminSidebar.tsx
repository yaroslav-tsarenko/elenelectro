"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree,
  Upload, BarChart3, Rss, FileText, Settings, Star, Image,
  LogOut, Store, Home,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { section: "Catalog" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
  { href: "/admin/import", icon: Upload, label: "Import" },
  { section: "Sales" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { section: "Marketing" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/feeds", icon: Rss, label: "Feeds" },
  { section: "Content" },
  { href: "/admin/homepage", icon: Home, label: "Homepage" },
  { href: "/admin/content/banners", icon: Image, label: "Banners" },
  { href: "/admin/content/pages", icon: FileText, label: "Pages" },
  { section: "System" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <Store size={16} />
        </div>
        <div>
          <div className="admin-sidebar-brand">My Store</div>
          <div className="admin-sidebar-brand-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item, i) => {
          if ("section" in item) {
            return (
              <div key={i} className="admin-sidebar-section">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href!));
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`admin-sidebar-link ${isActive ? "admin-sidebar-link-active" : ""}`}
              style={{ position: "relative" }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.10)",
                  }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={16} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-footer-avatar">{initials}</div>
        <div className="admin-sidebar-footer-info">
          <div className="admin-sidebar-footer-name">{user?.name || "Admin"}</div>
          <div className="admin-sidebar-footer-email">{user?.email || ""}</div>
        </div>
        <button className="admin-topbar-icon" onClick={signOut} title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
