"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Copy, ExternalLink, Rss } from "lucide-react";
import { toast } from "sonner";

const feeds = [
  { name: "Google Merchant", type: "google", url: "/api/feeds/google", format: "XML" },
  { name: "Facebook / Instagram", type: "facebook", url: "/api/feeds/facebook", format: "CSV" },
  { name: "Generic Feed", type: "generic", url: "/api/feeds/generic", format: "JSON" },
];

export default function AdminFeedsPage() {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyUrl = (path: string) => {
    navigator.clipboard.writeText(`${siteUrl}${path}`);
    toast.success("Feed URL copied to clipboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Product Feeds</h1>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {feeds.map((feed, i) => (
          <motion.div
            key={feed.type}
            className="admin-item-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(255,255,255,0.06)" }}>
                <Rss size={20} style={{ color: "var(--admin-text-secondary)" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: "var(--admin-text)" }}>{feed.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontFamily: "var(--font-mono)" }}>{feed.url}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="admin-badge admin-badge-default">{feed.format}</span>
              <Button size="sm" variant="flat" startContent={<Copy size={14} />} onPress={() => copyUrl(feed.url)}>
                Copy URL
              </Button>
              <Button size="sm" variant="flat" as="a" href={feed.url} target="_blank" startContent={<ExternalLink size={14} />}>
                Preview
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
