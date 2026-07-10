"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, ChevronRight, FolderTree, Search } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
  children?: Category[];
}

interface ModalState {
  open: boolean;
  editId: string | null;
  name: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({
    open: false, editId: null, name: "", description: "", parentId: null, isActive: true,
  });

  const fetchCategories = () => {
    fetch("/api/categories?includeEmpty=true")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  useEffect(fetchCategories, []);

  const handleSave = async () => {
    if (!modal.name.trim()) return;
    try {
      const url = modal.editId ? `/api/categories/${modal.editId}` : "/api/categories";
      const method = modal.editId ? "PATCH" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modal.name,
          description: modal.description || undefined,
          parentId: modal.parentId || null,
          isActive: modal.isActive,
        }),
      });
      toast.success(modal.editId ? "Category updated" : "Category created");
      setModal({ open: false, editId: null, name: "", description: "", parentId: null, isActive: true });
      fetchCategories();
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category and all its subcategories?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const openEdit = (cat: Category) => {
    setModal({
      open: true,
      editId: cat.id,
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId || null,
      isActive: cat.isActive,
    });
  };

  const openNewChild = (parentId: string | null) => {
    setModal({
      open: false, editId: null, name: "", description: "", parentId, isActive: true,
    });
    setTimeout(() => setModal((m) => ({ ...m, open: true })), 10);
  };

  const allParentOptions = getAllCategories(categories);

  const filterCategories = (cats: Category[], query: string): Category[] => {
    if (!query) return cats;
    const q = query.toLowerCase();
    return cats.reduce<Category[]>((acc, cat) => {
      const childMatches = cat.children ? filterCategories(cat.children, query) : [];
      if (cat.name.toLowerCase().includes(q) || childMatches.length > 0) {
        acc.push({ ...cat, children: childMatches.length > 0 ? childMatches : cat.children?.filter((c) => c.name.toLowerCase().includes(q)) });
      }
      return acc;
    }, []);
  };

  const filteredCategories = filterCategories(categories, search);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Categories</h1>
        <Button color="primary" startContent={<Plus size={16} />} onPress={() => openNewChild(null)}>
          Add Category
        </Button>
      </div>

      <div style={{ position: "relative", maxWidth: "20rem", marginBottom: "1.25rem" }}>
        <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
        <input
          className="admin-input"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>
          <FolderTree size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p>No categories yet. Import products or create categories manually.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {filteredCategories.map((cat, i) => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              depth={0}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAddChild={openNewChild}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal((m) => ({ ...m, open: false }))}
            />
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: "480px" }}
            >
              <h3 className="admin-modal-title">
                {modal.editId ? "Edit" : "Add"} Category
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="admin-label">Name *</label>
                  <input
                    className="admin-input"
                    value={modal.name}
                    onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="admin-label">Description</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={modal.description}
                    onChange={(e) => setModal((m) => ({ ...m, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="admin-label">Parent Category</label>
                  <select
                    className="admin-select"
                    value={modal.parentId || ""}
                    onChange={(e) => setModal((m) => ({ ...m, parentId: e.target.value || null }))}
                  >
                    <option value="">— Top Level —</option>
                    {allParentOptions
                      .filter((o) => o.id !== modal.editId)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {"  ".repeat(o.depth)}{o.depth > 0 ? "└ " : ""}{o.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={modal.isActive}
                    onChange={(e) => setModal((m) => ({ ...m, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <Button variant="light" onPress={() => setModal((m) => ({ ...m, open: false }))}>Cancel</Button>
                <Button color="primary" onPress={handleSave}>Save</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryRow({
  cat, depth, index, onEdit, onDelete, onAddChild,
}: {
  cat: Category; depth: number; index: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const hasChildren = cat.children && cat.children.length > 0;
  const productCount = cat._count?.products || 0;

  return (
    <>
      <motion.div
        className="admin-item-card"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        style={{ marginLeft: `${depth * 1.5}rem` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
          {depth > 0 && (
            <ChevronRight size={14} style={{ color: "var(--admin-text-muted)", flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontWeight: 600,
              color: cat.isActive ? "var(--admin-text)" : "var(--admin-text-muted)",
              fontSize: depth === 0 ? "0.9375rem" : "0.875rem",
            }}>
              {cat.name}
            </span>
            {!cat.isActive && (
              <span style={{
                marginLeft: "0.5rem",
                fontSize: "0.6875rem",
                padding: "0.125rem 0.375rem",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255,71,87,0.1)",
                color: "var(--color-danger)",
                fontWeight: 600,
              }}>
                Inactive
              </span>
            )}
            <span style={{ color: "var(--admin-text-muted)", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
              {productCount} product{productCount !== 1 ? "s" : ""}
              {hasChildren ? ` · ${cat.children!.length} subcategor${cat.children!.length !== 1 ? "ies" : "y"}` : ""}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
          {depth < 2 && (
            <Button isIconOnly size="sm" variant="flat" onPress={() => onAddChild(cat.id)} aria-label="Add subcategory">
              <Plus size={14} />
            </Button>
          )}
          <Button isIconOnly size="sm" variant="flat" onPress={() => onEdit(cat)} aria-label="Edit category" style={{ color: "var(--admin-accent)" }}>
            <Pencil size={14} />
          </Button>
          <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => onDelete(cat.id)} aria-label="Delete category">
            <Trash2 size={14} />
          </Button>
        </div>
      </motion.div>
      {hasChildren && cat.children!.map((child, i) => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}

function getAllCategories(cats: Category[], depth = 0): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, name: cat.name, depth });
    if (cat.children) {
      result.push(...getAllCategories(cat.children, depth + 1));
    }
  }
  return result;
}
