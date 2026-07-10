"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validators/product";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

interface CategoryTree {
  id: string;
  name: string;
  children?: CategoryTree[];
}

function flattenCategories(cats: CategoryTree[], depth = 0): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, name: cat.name, depth });
    if (cat.children) result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [charRows, setCharRows] = useState<{ group: string; key: string; value: string }[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: { status: "DRAFT", condition: "new", trackInventory: true, isFeatured: false, quantity: 0, lowStockAlert: 5 },
  });

  const syncCharacteristics = (rows: { group: string; key: string; value: string }[]) => {
    const obj: Record<string, Record<string, string>> = {};
    rows.forEach((r) => {
      if (r.key) {
        const group = r.group || "General";
        if (!obj[group]) obj[group] = {};
        obj[group][r.key] = r.value;
      }
    });
    setValue("characteristics", Object.keys(obj).length > 0 ? obj : undefined);
  };

  useEffect(() => {
    fetch("/api/categories?includeEmpty=true")
      .then((res) => res.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product created");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "48rem" }}
    >
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Add Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="admin-form-card">
          <div className="admin-form-section-title">Basic Information</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Name *</label>
              <input className="admin-input" {...register("name")} />
              {errors.name && <span className="admin-field-error">{errors.name.message}</span>}
            </div>
            <div>
              <label className="admin-label">SKU *</label>
              <input className="admin-input" {...register("sku")} />
              {errors.sku && <span className="admin-field-error">{errors.sku.message}</span>}
            </div>
            <div>
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" rows={4} {...register("description")} />
            </div>
            <div>
              <label className="admin-label">Short Description</label>
              <input className="admin-input" {...register("shortDescription")} />
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">Pricing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="admin-label">Price *</label>
              <input type="number" step="0.01" className="admin-input" {...register("price")} />
              {errors.price && <span className="admin-field-error">{errors.price.message}</span>}
            </div>
            <div>
              <label className="admin-label">Compare Price</label>
              <input type="number" step="0.01" className="admin-input" {...register("comparePrice")} />
            </div>
            <div>
              <label className="admin-label">Cost Price</label>
              <input type="number" step="0.01" className="admin-input" {...register("costPrice")} />
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">Inventory</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="admin-label">Quantity</label>
              <input type="number" className="admin-input" {...register("quantity")} />
            </div>
            <div>
              <label className="admin-label">Low Stock Alert</label>
              <input type="number" className="admin-input" {...register("lowStockAlert")} />
            </div>
            <div>
              <label className="admin-label">Weight (kg)</label>
              <input type="number" step="0.01" className="admin-input" {...register("weight")} />
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">Organization</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-select" value={watch("status")} onChange={(e) => setValue("status", e.target.value as "DRAFT" | "ACTIVE" | "ARCHIVED")}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Categories</label>
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
                <input
                  className="admin-input"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.8125rem" }}
                />
              </div>
              <div style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid var(--admin-border)",
                borderRadius: "12px",
                background: "var(--admin-bg-input)",
                padding: "0.5rem",
              }}>
                {flattenCategories(categories)
                  .filter((cat) => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((cat) => {
                    const selected = watch("categoryIds") || [];
                    const isChecked = selected.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.375rem 0.5rem",
                          paddingLeft: `${0.5 + cat.depth * 1}rem`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          color: isChecked ? "var(--admin-accent)" : "var(--admin-text-secondary)",
                          fontWeight: isChecked ? 500 : 400,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-row-hover, rgba(255,255,255,0.03))")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const prev = selected;
                            const next = isChecked ? prev.filter((id: string) => id !== cat.id) : [...prev, cat.id];
                            setValue("categoryIds", next);
                          }}
                          style={{ accentColor: "var(--admin-accent)" }}
                        />
                        {cat.depth > 0 ? "└ " : ""}{cat.name}
                      </label>
                    );
                  })}
              </div>
            </div>
            <div style={{ display: "flex", gap: "2rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={watch("isFeatured")} onChange={(e) => setValue("isFeatured", e.target.checked)} />
                Featured
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={watch("trackInventory")} onChange={(e) => setValue("trackInventory", e.target.checked)} />
                Track Inventory
              </label>
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">Product Identifiers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Brand</label>
              <input className="admin-input" {...register("brand")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="admin-label">EAN (13 digits)</label>
                <input className="admin-input" maxLength={13} placeholder="4751234567890" {...register("ean")} />
                {errors.ean && <span className="admin-field-error">{errors.ean.message}</span>}
              </div>
              <div>
                <label className="admin-label">GTIN</label>
                <input className="admin-input" {...register("gtin")} />
              </div>
              <div>
                <label className="admin-label">MPN</label>
                <input className="admin-input" {...register("mpn")} />
              </div>
            </div>
            <div>
              <label className="admin-label">Google Category</label>
              <input className="admin-input" {...register("googleCategory")} />
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">Characteristics</div>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-text-tertiary)", marginBottom: "0.75rem" }}>
            Group similar properties under a section name (e.g. Dimensions, Connection, Materials).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {charRows.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  className="admin-input"
                  placeholder="Group (e.g. Dimensions)"
                  value={row.group}
                  onChange={(e) => {
                    const next = [...charRows];
                    next[i] = { ...next[i], group: e.target.value };
                    setCharRows(next);
                    syncCharacteristics(next);
                  }}
                  style={{ flex: 0.8 }}
                />
                <input
                  className="admin-input"
                  placeholder="Name (e.g. Height)"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...charRows];
                    next[i] = { ...next[i], key: e.target.value };
                    setCharRows(next);
                    syncCharacteristics(next);
                  }}
                  style={{ flex: 1 }}
                />
                <input
                  className="admin-input"
                  placeholder="Value (e.g. 703 mm)"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...charRows];
                    next[i] = { ...next[i], value: e.target.value };
                    setCharRows(next);
                    syncCharacteristics(next);
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = charRows.filter((_, j) => j !== i);
                    setCharRows(next);
                    syncCharacteristics(next);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-text-tertiary)", padding: "0.5rem" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCharRows([...charRows, { group: charRows[charRows.length - 1]?.group || "", key: "", value: "" }])}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                background: "none", border: "1px dashed var(--admin-border)", borderRadius: "var(--radius-md)",
                padding: "0.625rem 1rem", cursor: "pointer", color: "var(--admin-text-secondary)", fontSize: "0.875rem",
              }}
            >
              <Plus size={14} /> Add Characteristic
            </button>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-section-title">SEO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Meta Title</label>
              <input className="admin-input" {...register("metaTitle")} />
            </div>
            <div>
              <label className="admin-label">Meta Description</label>
              <input className="admin-input" {...register("metaDescription")} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <Button variant="light" onPress={() => router.back()}>Cancel</Button>
          <Button type="submit" color="primary" isLoading={loading}>Create Product</Button>
        </div>
      </form>
    </motion.div>
  );
}
