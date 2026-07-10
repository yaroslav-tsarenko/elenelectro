"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validators/product";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { toast } from "sonner";
import { Plus, Trash2, Upload, GripVertical, Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

function flattenCategories(cats: Category[], depth = 0): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, name: cat.name, depth });
    if (cat.children) result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [charRows, setCharRows] = useState<{ group: string; key: string; value: string }[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
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
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/categories?includeEmpty=true").then((r) => r.json()),
    ]).then(([product, cats]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setImages(product.images || []);

      const chars = product.characteristics as Record<string, Record<string, string>> | null;
      if (chars) {
        const rows: { group: string; key: string; value: string }[] = [];
        Object.entries(chars).forEach(([group, entries]) => {
          Object.entries(entries).forEach(([key, value]) => {
            rows.push({ group, key, value });
          });
        });
        setCharRows(rows);
      }

      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
        costPrice: product.costPrice ? Number(product.costPrice) : undefined,
        quantity: product.quantity,
        lowStockAlert: product.lowStockAlert,
        weight: product.weight ? Number(product.weight) : undefined,
        status: product.status,
        isFeatured: product.isFeatured,
        trackInventory: product.trackInventory,
        brand: product.brand || "",
        gtin: product.gtin || "",
        ean: product.ean || "",
        mpn: product.mpn || "",
        googleCategory: product.googleCategory || "",
        condition: product.condition || "new",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        categoryIds: product.categories?.map((c: { categoryId: string }) => c.categoryId) || [],
        characteristics: product.characteristics || undefined,
      });
      setFetching(false);
    }).catch(console.error);
  }, [id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product updated");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch(`/api/products/${id}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setImages((prev) => [...prev, ...data.images]);
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      await fetch(`/api/products/${id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const flatCats = flattenCategories(categories);

  if (fetching) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "48rem" }}
    >
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Edit Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Images */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Product Images</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  width: "110px",
                  height: "110px",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-bg-secondary)",
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt || "Product image"}
                  fill
                  sizes="110px"
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.id)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0",
                  }}
                >
                  <Trash2 size={12} />
                </button>
                <div style={{
                  position: "absolute",
                  bottom: "4px",
                  left: "4px",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  fontSize: "0.625rem",
                  padding: "0.0625rem 0.25rem",
                  borderRadius: "var(--radius-sm)",
                }}>
                  <GripVertical size={10} style={{ display: "inline", verticalAlign: "middle" }} /> {img.sortOrder + 1}
                </div>
              </div>
            ))}

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "var(--radius-lg)",
                border: "2px dashed var(--admin-border)",
                background: "none",
                cursor: uploading ? "wait" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                color: "var(--admin-text-muted)",
                fontSize: "0.75rem",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              {uploading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Upload size={20} />
                  Upload
                </>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          {images.length === 0 && (
            <p style={{ fontSize: "0.8125rem", color: "var(--admin-text-muted)" }}>
              <ImageIcon size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.25rem" }} />
              Upload product images. First image is the main photo.
            </p>
          )}
        </div>

        {/* Basic Info */}
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
              <label className="admin-label">Short Description</label>
              <input className="admin-input" {...register("shortDescription")} placeholder="Brief summary shown on product card" />
            </div>
            <div>
              <label className="admin-label">Full Description</label>
              <textarea className="admin-textarea" rows={5} {...register("description")} />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Pricing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="admin-label">Price *</label>
              <input type="number" step="0.01" className="admin-input" {...register("price")} />
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

        {/* Inventory */}
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

        {/* Organization */}
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
                {flatCats
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

        {/* Product Identifiers */}
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

        {/* Characteristics */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Characteristics</div>
          <p style={{ fontSize: "0.8125rem", color: "var(--admin-text-tertiary)", marginBottom: "0.75rem" }}>
            Group similar properties under a section name (e.g. Dimensions, Connection, Materials).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {charRows.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  className="admin-input"
                  placeholder="Group"
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
                  placeholder="Name"
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
                  placeholder="Value"
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
                  <Trash2 size={14} />
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

        {/* SEO */}
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
          <Button type="submit" color="primary" isLoading={loading}>Save Changes</Button>
        </div>
      </form>
    </motion.div>
  );
}
