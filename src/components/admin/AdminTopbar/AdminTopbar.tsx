"use client";

import { Search, Bell, Sun, Moon, ExternalLink } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

export function AdminTopbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <div className="admin-topbar-search">
          <Search size={14} />
          <span>Search...</span>
          <span style={{ marginLeft: "auto", opacity: 0.4, fontSize: "0.6875rem", fontFamily: "var(--font-mono)" }}>⌘K</span>
        </div>
      </div>
      <div className="admin-topbar-right">
        <button className="admin-topbar-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="admin-topbar-icon" title="Notifications" style={{ position: "relative" }}>
          <Bell size={16} />
        </button>
        <Link href="/en" className="admin-topbar-icon" title="View store">
          <ExternalLink size={15} />
        </Link>
      </div>
    </header>
  );
}
