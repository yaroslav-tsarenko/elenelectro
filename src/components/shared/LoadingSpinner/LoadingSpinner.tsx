"use client";

import { Spinner } from "@heroui/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
      <Spinner size={size} />
      {label && <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{label}</span>}
    </div>
  );
}
