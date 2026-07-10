"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function AdminPagesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pages</h1>
        <Button color="primary" startContent={<Plus size={16} />}>Add Page</Button>
      </div>

      <p style={{ color: "var(--admin-text-secondary)" }}>
        Manage static pages like About, FAQ, etc. Pages are edited using a rich text editor.
      </p>
    </motion.div>
  );
}
