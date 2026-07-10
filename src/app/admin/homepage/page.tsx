"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp, Eye, EyeOff,
  LayoutDashboard, Image, Tag, Layers, Grid3X3, Type, Link2, Megaphone, Award
} from "lucide-react";

type Tab = "banners" | "brands" | "sections" | "tabs" | "utility" | "promo-strip";

interface BannerItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaLabel?: string;
  bgColor: string;
  textColor: string;
  badgeText?: string;
  oldPrice?: string;
  newPrice?: string;
  discountText?: string;
  isActive: boolean;
  sortOrder: number;
}

interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

interface SectionItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  filterType: string;
  categorySlug?: string;
  maxProducts: number;
  viewAllUrl?: string;
  viewAllLabel: string;
  bgStyle: string;
  columns: number;
  isActive: boolean;
  sortOrder: number;
}

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  linkUrl: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

interface UtilityLinkItem {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
}

interface PromoStripItemData {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "banners", label: "Banners & Slides", icon: Image },
  { key: "brands", label: "Brands", icon: Award },
  { key: "sections", label: "Product Sections", icon: Grid3X3 },
  { key: "tabs", label: "Navigation Tabs", icon: Layers },
  { key: "utility", label: "Utility Links", icon: Link2 },
  { key: "promo-strip", label: "Promo Strip", icon: Megaphone },
];

const BANNER_TYPES = [
  { value: "HERO", label: "Hero Slide" },
  { value: "PROMO_SMALL", label: "Small Promo Banner" },
  { value: "PROMO_WIDE", label: "Wide Promo Banner" },
  { value: "DEAL_CARD", label: "Deal Card" },
];

const FILTER_TYPES = [
  { value: "featured", label: "Featured Products" },
  { value: "newest", label: "Newest Products" },
  { value: "onSale", label: "On Sale" },
  { value: "popular", label: "Popular" },
  { value: "category", label: "By Category" },
  { value: "all", label: "All Products" },
];

const ICON_OPTIONS = [
  "Truck", "RotateCcw", "Shield", "Gift", "Award", "Headphones",
  "Zap", "Heart", "Star", "Package", "Clock", "CheckCircle",
];

export default function HomepageAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("banners");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [utilityLinks, setUtilityLinks] = useState<UtilityLinkItem[]>([]);
  const [promoStrip, setPromoStrip] = useState<PromoStripItemData[]>([]);

  const [editModal, setEditModal] = useState<{ type: Tab; item: Record<string, unknown> | null } | null>(null);

  const fetchData = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const endpoints: Record<Tab, string> = {
        banners: "/api/homepage/banners",
        brands: "/api/homepage/brands",
        sections: "/api/homepage/sections",
        tabs: "/api/homepage/tabs",
        utility: "/api/homepage/utility-links",
        "promo-strip": "/api/homepage/promo-strip",
      };
      const res = await fetch(endpoints[tab]);
      const data = await res.json();
      const items = data.data || data;

      switch (tab) {
        case "banners": setBanners(items); break;
        case "brands": setBrands(items); break;
        case "sections": setSections(items); break;
        case "tabs": setTabs(items); break;
        case "utility": setUtilityLinks(items); break;
        case "promo-strip": setPromoStrip(items); break;
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/homepage/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seed failed");
      toast.success("Homepage data seeded successfully!");
      fetchData(activeTab);
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (tab: Tab, id: string) => {
    if (!confirm("Delete this item?")) return;
    const endpoints: Record<Tab, string> = {
      banners: "/api/homepage/banners",
      brands: "/api/homepage/brands",
      sections: "/api/homepage/sections",
      tabs: "/api/homepage/tabs",
      utility: "/api/homepage/utility-links",
      "promo-strip": "/api/homepage/promo-strip",
    };
    try {
      const res = await fetch(`${endpoints[tab]}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      fetchData(tab);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleActive = async (tab: Tab, id: string, currentActive: boolean) => {
    const endpoints: Record<Tab, string> = {
      banners: "/api/homepage/banners",
      brands: "/api/homepage/brands",
      sections: "/api/homepage/sections",
      tabs: "/api/homepage/tabs",
      utility: "/api/homepage/utility-links",
      "promo-strip": "/api/homepage/promo-strip",
    };
    try {
      const res = await fetch(`${endpoints[tab]}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error();
      fetchData(tab);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleSave = async (tab: Tab, item: Record<string, unknown>) => {
    const endpoints: Record<Tab, string> = {
      banners: "/api/homepage/banners",
      brands: "/api/homepage/brands",
      sections: "/api/homepage/sections",
      tabs: "/api/homepage/tabs",
      utility: "/api/homepage/utility-links",
      "promo-strip": "/api/homepage/promo-strip",
    };
    const isEdit = !!item.id;
    try {
      const url = isEdit ? `${endpoints[tab]}/${item.id}` : endpoints[tab];
      const method = isEdit ? "PATCH" : "POST";
      const body = { ...item };
      if (!isEdit) delete body.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      toast.success(isEdit ? "Updated" : "Created");
      setEditModal(null);
      fetchData(tab);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const openCreate = (tab: Tab) => {
    const defaults: Record<Tab, Record<string, unknown>> = {
      banners: { type: "HERO", title: "", bgColor: "#1A1A2E", textColor: "#ffffff", isActive: true, sortOrder: 0 },
      brands: { name: "", isActive: true, sortOrder: 0 },
      sections: { title: "", slug: "", filterType: "featured", maxProducts: 5, viewAllLabel: "View all", bgStyle: "white", columns: 5, isActive: true, sortOrder: 0 },
      tabs: { label: "", linkUrl: "", color: "#333333", isActive: true, sortOrder: 0 },
      utility: { label: "", linkUrl: "", position: "left", isActive: true, sortOrder: 0 },
      "promo-strip": { icon: "Truck", title: "", isActive: true, sortOrder: 0 },
    };
    setEditModal({ type: tab, item: defaults[tab] });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Homepage Manager</h1>
          <p style={{ color: "#888", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Manage all homepage content</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          style={{
            padding: "0.5rem 1rem", background: "#1A1A2E", color: "#fff",
            border: "none", borderRadius: "6px", fontSize: "0.8125rem",
            fontWeight: 600, cursor: "pointer", opacity: seeding ? 0.6 : 1,
          }}
        >
          {seeding ? "Seeding..." : "Seed Default Data"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", borderRadius: "6px",
              border: activeTab === t.key ? "2px solid #E53935" : "1px solid #e0e0e0",
              background: activeTab === t.key ? "#FFF5F5" : "#fff",
              color: activeTab === t.key ? "#E53935" : "#555",
              fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
          {TABS.find((t) => t.key === activeTab)?.label}
        </h2>
        <button
          onClick={() => openCreate(activeTab)}
          style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            padding: "0.4rem 0.75rem", background: "#E53935", color: "#fff",
            border: "none", borderRadius: "6px", fontSize: "0.8125rem",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Add New
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {activeTab === "banners" && renderBannersList(banners, (item) => setEditModal({ type: "banners", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("banners", id), (id, active) => handleToggleActive("banners", id, active))}
          {activeTab === "brands" && renderBrandsList(brands, (item) => setEditModal({ type: "brands", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("brands", id), (id, active) => handleToggleActive("brands", id, active))}
          {activeTab === "sections" && renderSectionsList(sections, (item) => setEditModal({ type: "sections", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("sections", id), (id, active) => handleToggleActive("sections", id, active))}
          {activeTab === "tabs" && renderTabsList(tabs, (item) => setEditModal({ type: "tabs", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("tabs", id), (id, active) => handleToggleActive("tabs", id, active))}
          {activeTab === "utility" && renderUtilityList(utilityLinks, (item) => setEditModal({ type: "utility", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("utility", id), (id, active) => handleToggleActive("utility", id, active))}
          {activeTab === "promo-strip" && renderPromoStripList(promoStrip, (item) => setEditModal({ type: "promo-strip", item: item as unknown as Record<string, unknown> }), (id) => handleDelete("promo-strip", id), (id, active) => handleToggleActive("promo-strip", id, active))}
        </div>
      )}

      {editModal && (
        <EditModal
          type={editModal.type}
          item={editModal.item}
          onClose={() => setEditModal(null)}
          onSave={(item) => handleSave(editModal.type, item)}
        />
      )}
    </div>
  );
}

function ItemRow({ title, subtitle, active, onEdit, onDelete, onToggle, badges }: {
  title: string; subtitle?: string; active: boolean;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
  badges?: { label: string; color: string }[];
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem",
      background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px",
      opacity: active ? 1 : 0.5,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{title}</span>
          {badges?.map((b) => (
            <span key={b.label} style={{
              fontSize: "0.65rem", fontWeight: 600, padding: "1px 6px",
              borderRadius: "4px", background: b.color, color: "#fff",
            }}>{b.label}</span>
          ))}
        </div>
        {subtitle && <p style={{ fontSize: "0.75rem", color: "#888", margin: "0.125rem 0 0" }}>{subtitle}</p>}
      </div>
      <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: active ? "#4CAF50" : "#999", padding: "4px" }}>
        {active ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "4px" }}>
        <Save size={16} />
      </button>
      <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#E53935", padding: "4px" }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function renderBannersList(items: BannerItem[], onEdit: (i: BannerItem) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.title} subtitle={i.subtitle || i.linkUrl || ""} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)}
      badges={[{ label: BANNER_TYPES.find((t) => t.value === i.type)?.label || i.type, color: i.type === "HERO" ? "#2196F3" : i.type === "DEAL_CARD" ? "#FF9800" : "#4CAF50" }]}
    />
  ));
}

function renderBrandsList(items: BrandItem[], onEdit: (i: BrandItem) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.name} subtitle={i.linkUrl || ""} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)} />
  ));
}

function renderSectionsList(items: SectionItem[], onEdit: (i: SectionItem) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.title} subtitle={`Filter: ${i.filterType} | Max: ${i.maxProducts} | Columns: ${i.columns}`} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)}
      badges={[{ label: i.filterType, color: "#6C5CE7" }]}
    />
  ));
}

function renderTabsList(items: TabItem[], onEdit: (i: TabItem) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.label} subtitle={i.linkUrl} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)} />
  ));
}

function renderUtilityList(items: UtilityLinkItem[], onEdit: (i: UtilityLinkItem) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.label} subtitle={`${i.position} | ${i.linkUrl}`} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)}
      badges={[{ label: i.position, color: i.position === "left" ? "#2196F3" : "#FF9800" }]}
    />
  ));
}

function renderPromoStripList(items: PromoStripItemData[], onEdit: (i: PromoStripItemData) => void, onDelete: (id: string) => void, onToggle: (id: string, a: boolean) => void) {
  if (!items.length) return <EmptyState />;
  return items.map((i) => (
    <ItemRow key={i.id} title={i.title} subtitle={i.subtitle || ""} active={i.isActive}
      onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id)} onToggle={() => onToggle(i.id, i.isActive)}
      badges={[{ label: i.icon, color: "#E53935" }]}
    />
  ));
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#999", background: "#fafafa", borderRadius: "8px", border: "1px dashed #e0e0e0" }}>
      <LayoutDashboard size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
      <p style={{ margin: 0, fontWeight: 500 }}>No items yet</p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem" }}>Click &ldquo;Add New&rdquo; to create one, or &ldquo;Seed Default Data&rdquo; to populate all sections.</p>
    </div>
  );
}

function EditModal({ type, item, onClose, onSave }: {
  type: Tab; item: Record<string, unknown> | null;
  onClose: () => void; onSave: (item: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(item || {});
  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #e0e0e0",
    borderRadius: "6px", fontSize: "0.8125rem", outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem", display: "block" };

  const Field = ({ label, field, type: inputType = "text" }: { label: string; field: string; type?: string }) => (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={labelStyle}>{label}</label>
      {inputType === "select-banner" ? (
        <select style={inputStyle} value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)}>
          {BANNER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      ) : inputType === "select-filter" ? (
        <select style={inputStyle} value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)}>
          {FILTER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      ) : inputType === "select-icon" ? (
        <select style={inputStyle} value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)}>
          {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      ) : inputType === "select-position" ? (
        <select style={inputStyle} value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)}>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      ) : inputType === "select-bg" ? (
        <select style={inputStyle} value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)}>
          <option value="white">White</option>
          <option value="gray">Gray</option>
        </select>
      ) : inputType === "number" ? (
        <input style={inputStyle} type="number" value={(form[field] as number) ?? ""} onChange={(e) => set(field, parseInt(e.target.value) || 0)} />
      ) : inputType === "checkbox" ? (
        <input type="checkbox" checked={!!form[field]} onChange={(e) => set(field, e.target.checked)} />
      ) : inputType === "color" ? (
        <input style={{ ...inputStyle, height: "38px", padding: "2px" }} type="color" value={(form[field] as string) || "#000000"} onChange={(e) => set(field, e.target.value)} />
      ) : (
        <input style={inputStyle} type="text" value={(form[field] as string) || ""} onChange={(e) => set(field, e.target.value)} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "min(560px, 95vw)", maxHeight: "85vh", overflow: "auto", padding: "1.5rem" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 1rem", fontWeight: 700, fontSize: "1.125rem" }}>
          {form.id ? "Edit" : "Create"} {TABS.find((t) => t.key === type)?.label.replace(/s$/, "")}
        </h3>

        {type === "banners" && (
          <>
            <Field label="Type" field="type" type="select-banner" />
            <Field label="Title" field="title" />
            <Field label="Subtitle" field="subtitle" />
            <Field label="Description" field="description" />
            <Field label="Image URL" field="imageUrl" />
            <Field label="Link URL" field="linkUrl" />
            <Field label="CTA Label" field="ctaLabel" />
            <Field label="Badge Text" field="badgeText" />
            <Field label="Old Price" field="oldPrice" />
            <Field label="New Price" field="newPrice" />
            <Field label="Discount Text" field="discountText" />
            <Field label="Background Color" field="bgColor" type="color" />
            <Field label="Text Color" field="textColor" type="color" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        {type === "brands" && (
          <>
            <Field label="Brand Name" field="name" />
            <Field label="Logo URL" field="logoUrl" />
            <Field label="Link URL" field="linkUrl" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        {type === "sections" && (
          <>
            <Field label="Title" field="title" />
            <Field label="Subtitle" field="subtitle" />
            <Field label="Slug" field="slug" />
            <Field label="Filter Type" field="filterType" type="select-filter" />
            <Field label="Category Slug (for category filter)" field="categorySlug" />
            <Field label="Max Products" field="maxProducts" type="number" />
            <Field label="View All URL" field="viewAllUrl" />
            <Field label="View All Label" field="viewAllLabel" />
            <Field label="Background Style" field="bgStyle" type="select-bg" />
            <Field label="Columns" field="columns" type="number" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        {type === "tabs" && (
          <>
            <Field label="Label" field="label" />
            <Field label="Link URL" field="linkUrl" />
            <Field label="Icon Name" field="icon" />
            <Field label="Color" field="color" type="color" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        {type === "utility" && (
          <>
            <Field label="Label" field="label" />
            <Field label="Link URL" field="linkUrl" />
            <Field label="Icon Name" field="icon" />
            <Field label="Position" field="position" type="select-position" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        {type === "promo-strip" && (
          <>
            <Field label="Icon" field="icon" type="select-icon" />
            <Field label="Title" field="title" />
            <Field label="Subtitle" field="subtitle" />
            <Field label="Link URL" field="linkUrl" />
            <Field label="Sort Order" field="sortOrder" type="number" />
          </>
        )}

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button onClick={onClose} style={{ padding: "0.5rem 1rem", background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: "6px", cursor: "pointer", fontSize: "0.8125rem" }}>
            Cancel
          </button>
          <button onClick={() => onSave(form)} style={{ padding: "0.5rem 1rem", background: "#E53935", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            {form.id ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
