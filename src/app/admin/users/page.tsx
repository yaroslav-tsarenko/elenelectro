"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { Users, ShoppingCart, Star } from "lucide-react";
import { format } from "date-fns";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number; reviews: number };
}

const roleColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  CUSTOMER: "default",
  ADMIN: "accent",
  SUPER_ADMIN: "danger",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={24} /> Users
        </h1>
        <span className="admin-badge admin-badge-default">{users.length} total</span>
      </div>

      <div className="admin-table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th style={{ textAlign: "center" }}>Orders</th>
              <th style={{ textAlign: "center" }}>Reviews</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--admin-text)" }}>{u.name || "—"}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>{u.email}</p>
                  </div>
                </td>
                <td>
                  <Chip size="sm" color={roleColors[u.role] || "default"}>{u.role}</Chip>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--admin-text-secondary)" }}>
                    <ShoppingCart size={14} /> {u._count.orders}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--admin-text-secondary)" }}>
                    <Star size={14} /> {u._count.reviews}
                  </span>
                </td>
                <td style={{ color: "var(--admin-text-muted)" }}>
                  {format(new Date(u.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
