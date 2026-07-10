"use client";

import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar/AdminTopbar";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import "@/styles/admin.css";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="admin-layout" data-admin-theme data-theme={theme}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
