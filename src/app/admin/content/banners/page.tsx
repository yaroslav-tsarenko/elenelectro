"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const fetchBanners = () => {
    fetch("/api/settings").catch(console.error);
  };

  useEffect(fetchBanners, []);

  const handleCreate = async () => {
    toast.success("Banner feature configured - connect to Supabase to persist");
    setIsOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Banners</h1>
        <Button color="primary" startContent={<Plus size={16} />} onPress={() => setIsOpen(true)}>Add Banner</Button>
      </div>

      {banners.length === 0 && (
        <p style={{ color: "var(--admin-text-secondary)" }}>No banners yet. Add your first banner.</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="admin-modal-title">Add Banner</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="admin-label">Title</label>
                  <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Subtitle</label>
                  <input className="admin-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Image URL</label>
                  <input className="admin-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Link URL</label>
                  <input className="admin-input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <Button variant="light" onPress={() => setIsOpen(false)}>Cancel</Button>
                <Button color="primary" onPress={handleCreate}>Create</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
