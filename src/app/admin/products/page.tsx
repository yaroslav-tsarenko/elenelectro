"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Chip } from "@heroui/react";
import { Plus, Search, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/format-price";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status: string;
  images: { url: string }[];
}

const statusColors: Record<string, "success" | "warning" | "default"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  ARCHIVED: "default",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20", search, status: "ALL" });
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search]);

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", productIds: Array.from(selected) }),
      });
      toast.success(`${selected.size} products deleted`);
      setSelected(new Set());
      fetchData();
    } catch {
      toast.error("Failed to delete products");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <Button as={Link} href="/admin/products/new" color="primary" startContent={<Plus size={16} />}>
          Add Product
        </Button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "20rem", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
          <input
            className="admin-input"
            placeholder="Search by name, SKU, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        {selected.size > 0 && (
          <Button color="danger" variant="flat" startContent={<Trash2 size={16} />} onPress={handleBulkDelete}>
            Delete ({selected.size})
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="admin-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>Product</th>
                <th>SKU</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right" }}>Stock</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} />
                  </td>
                  <td>
                    <Link href={`/admin/products/${product.id}`} style={{ fontWeight: 500, color: "var(--admin-accent)" }}>
                      {product.name}
                    </Link>
                  </td>
                  <td style={{ color: "var(--admin-text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>{product.sku}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "var(--admin-text)" }}>{formatPrice(Number(product.price))}</td>
                  <td style={{ textAlign: "right" }}>{product.quantity}</td>
                  <td style={{ textAlign: "center" }}>
                    <Chip size="sm" color={statusColors[product.status] || "default"}>{product.status}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button size="sm" variant="flat" isDisabled={page <= 1} onPress={() => setPage(page - 1)}>Previous</Button>
          <span className="admin-pagination-info">Page {page} of {totalPages}</span>
          <Button size="sm" variant="flat" isDisabled={page >= totalPages} onPress={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </motion.div>
  );
}
