"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" | "danger-soft" | "light" | "flat" | "bordered";
  color?: "primary" | "danger" | "success" | "warning" | "default";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  as?: React.ElementType;
  href?: string;
  target?: string;
  download?: boolean;
  onPress?: () => void;
  [key: string]: unknown;
}

export function Button({
  variant = "primary",
  color,
  size = "md",
  isLoading = false,
  isDisabled = false,
  isIconOnly = false,
  fullWidth = false,
  startContent,
  endContent,
  as,
  href,
  target,
  download,
  onPress,
  children,
  style,
  onClick,
  ...rest
}: ButtonProps) {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: isIconOnly ? "0.375rem" : "0.375rem 0.75rem", fontSize: "0.8125rem" },
    md: { padding: isIconOnly ? "0.5rem" : "0.5rem 1rem", fontSize: "0.875rem" },
    lg: { padding: isIconOnly ? "0.625rem" : "0.625rem 1.5rem", fontSize: "1rem" },
  };

  const resolvedVariant = resolveVariant(variant, color);

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-accent)", color: "#fff", border: "none" },
    secondary: { background: "var(--color-bg-secondary)", color: "var(--color-text)", border: "1px solid var(--color-border)" },
    tertiary: { background: "transparent", color: "var(--color-text-secondary)", border: "none" },
    outline: { background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" },
    ghost: { background: "transparent", color: "var(--color-text)", border: "none" },
    danger: { background: "var(--color-danger)", color: "#fff", border: "none" },
    "danger-soft": { background: "var(--color-danger-bg, rgba(239,68,68,0.1))", color: "var(--color-danger)", border: "none" },
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    borderRadius: "var(--radius-lg)",
    fontWeight: 600,
    cursor: isDisabled || isLoading ? "not-allowed" : "pointer",
    opacity: isDisabled || isLoading ? 0.6 : 1,
    transition: "all 0.2s ease",
    textDecoration: "none",
    width: fullWidth ? "100%" : undefined,
    ...sizeStyles[size],
    ...variantStyles[resolvedVariant],
    ...style,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) return;
    onClick?.(e);
    onPress?.();
  };

  const content = (
    <>
      {isLoading && <span style={{ width: "1em", height: "1em", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
      {!isLoading && startContent}
      {!isIconOnly && children}
      {endContent}
    </>
  );

  if (as || href) {
    const Component = as || "a";
    return (
      <Component href={href} target={target} download={download} style={baseStyle} onClick={handleClick} {...rest}>
        {content}
      </Component>
    );
  }

  return (
    <button type={rest.type || "button"} style={baseStyle} onClick={handleClick} disabled={isDisabled || isLoading} {...rest}>
      {content}
    </button>
  );
}

function resolveVariant(variant: string, color?: string): string {
  if (color === "primary") return "primary";
  if (color === "danger" && (variant === "flat" || variant === "light")) return "danger-soft";
  if (color === "danger") return "danger";
  if (color === "success") return "primary";
  if (variant === "light" || variant === "flat") return "ghost";
  if (variant === "bordered") return "outline";
  return variant;
}
