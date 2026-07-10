"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

interface Settings {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  primaryColor: string;
  secondaryColor: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  metaTitle: string;
  metaDescription: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.error ? null : d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!settings) return <div className="admin-empty">Failed to load settings</div>;

  const update = (key: keyof Settings, value: string | number) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "40rem" }}
    >
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Store Settings</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Appearance */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--admin-text)" }}>Theme</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}>
                Switch between light and dark mode
              </div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                border: "1px solid var(--admin-border)",
                background: "rgba(255,255,255,0.06)",
                color: "var(--admin-text)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* General */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">General</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Store Name</label>
              <input className="admin-input" value={settings.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" value={settings.description || ""} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="admin-label">Currency</label>
                <input className="admin-input" value={settings.currency} onChange={(e) => update("currency", e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Tax Rate (%)</label>
                <input type="number" className="admin-input" value={String(settings.taxRate)} onChange={(e) => update("taxRate", parseFloat(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Contact</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Email</label>
              <input className="admin-input" value={settings.email || ""} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Phone</label>
              <input className="admin-input" value={settings.phone || ""} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Address</label>
              <input className="admin-input" value={settings.address || ""} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Colors</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="admin-label">Primary Color</label>
              <input type="color" className="admin-input" style={{ padding: "4px" }} value={settings.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Secondary Color</label>
              <input type="color" className="admin-input" style={{ padding: "4px" }} value={settings.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">Social Media</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Facebook</label>
              <input className="admin-input" value={settings.facebook || ""} onChange={(e) => update("facebook", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Instagram</label>
              <input className="admin-input" value={settings.instagram || ""} onChange={(e) => update("instagram", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">TikTok</label>
              <input className="admin-input" value={settings.tiktok || ""} onChange={(e) => update("tiktok", e.target.value)} />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="admin-form-card">
          <div className="admin-form-section-title">SEO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="admin-label">Meta Title</label>
              <input className="admin-input" value={settings.metaTitle || ""} onChange={(e) => update("metaTitle", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Meta Description</label>
              <textarea className="admin-textarea" value={settings.metaDescription || ""} onChange={(e) => update("metaDescription", e.target.value)} />
            </div>
          </div>
        </div>

        <Button color="primary" onPress={handleSave} isLoading={saving} style={{ marginTop: "0.5rem" }}>
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}
