"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Chip } from "@heroui/react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface PreviewRow {
  row: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

interface PreviewResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: PreviewRow[];
  mode: string;
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("full");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ processed: number; errors: number } | null>(null);

  const handlePreview = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      const res = await fetch("/api/import/preview", { method: "POST", body: formData });
      const data = await res.json();
      setPreview(data);
    } catch {
      toast.error("Failed to preview file");
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const validRows = preview.rows.filter((r) => r.valid).map((r) => r.data);
      const res = await fetch("/api/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows, mode }),
      });
      const data = await res.json();
      setResult({ processed: data.processed, errors: data.errors });
      toast.success(`Import complete: ${data.processed} processed, ${data.errors} errors`);
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Import Products</h1>
        <Button
          as="a"
          href="/api/import/template"
          download
          variant="bordered"
          startContent={<Download size={16} />}
        >
          Download Template
        </Button>
      </div>

      <div className="admin-form-card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="admin-label">Import Mode</label>
            <select className="admin-select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="full">Full Import (Create/Update)</option>
              <option value="price">Price Update Only</option>
              <option value="stock">Stock Update Only</option>
            </select>
          </div>

          <div
            className="admin-upload-zone"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <FileSpreadsheet size={32} style={{ margin: "0 auto 0.5rem", color: "var(--admin-text-muted)" }} />
            <p style={{ fontWeight: 500, color: "var(--admin-text)" }}>{file ? file.name : "Click to upload CSV or Excel file"}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>Supports .csv, .xlsx</p>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button color="primary" onPress={handlePreview} isDisabled={!file} startContent={<Upload size={16} />}>
            Preview Import
          </Button>
        </div>
      </div>

      {preview && (
        <div className="admin-form-card" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <span className="admin-badge admin-badge-default">{preview.totalRows} total rows</span>
            <span className="admin-badge admin-badge-success">{preview.validCount} valid</span>
            <span className="admin-badge admin-badge-danger">{preview.errorCount} errors</span>
          </div>

          <div className="admin-table-container" style={{ maxHeight: "300px", overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 50).map((row) => (
                  <tr key={row.row}>
                    <td>{row.row}</td>
                    <td><Chip size="sm" color={row.valid ? "success" : "danger"}>{row.valid ? "OK" : "Error"}</Chip></td>
                    <td>{row.data.name}</td>
                    <td>{row.data.sku}</td>
                    <td>{row.data.price}</td>
                    <td style={{ color: "var(--admin-danger)" }}>{row.errors.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            color="primary"
            onPress={handleImport}
            isLoading={importing}
            isDisabled={preview.validCount === 0}
            style={{ marginTop: "1rem" }}
            fullWidth
          >
            Execute Import ({preview.validCount} rows)
          </Button>
        </div>
      )}

      {result && (
        <div className="admin-form-card">
          <div className="admin-form-section-title">Import Result</div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <span className="admin-badge admin-badge-success">{result.processed} processed</span>
            <span className="admin-badge admin-badge-danger">{result.errors} errors</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
