"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1rem",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <div style={{ color: "var(--color-text-tertiary)" }}>
        {icon || <PackageOpen size={48} />}
      </div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)" }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "24rem" }}>
          {subtitle}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button as={Link} href={actionHref} color="primary" variant="flat">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
