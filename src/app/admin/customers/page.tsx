"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";

interface Customer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => setCustomers(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Customers</h1>

      <div style={{ position: "relative", maxWidth: "20rem", marginBottom: "1.25rem" }}>
        <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
        <input
          className="admin-input"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="admin-table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th style={{ textAlign: "right" }}>Orders</th>
                <th style={{ textAlign: "right" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 500, color: "var(--admin-text)" }}>{customer.name || "—"}</td>
                  <td style={{ color: "var(--admin-text-secondary)" }}>{customer.email}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="admin-badge admin-badge-default">{customer._count.orders}</span>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--admin-text-muted)" }}>{format(new Date(customer.createdAt), "MMM d, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
