const PLACEHOLDER_BASE = "https://placehold.co";

const CATEGORY_COLORS: Record<string, string> = {
  electronics: "1A1A2E/FFFFFF",
  clothing: "2D3436/FFFFFF",
  "home-garden": "4A6741/FFFFFF",
  sports: "E53935/FFFFFF",
  default: "6C6C6C/FFFFFF",
};

export function getProductImage(
  imageUrl: string | null | undefined,
  productName?: string,
  size = "400x400"
): string {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
    return imageUrl;
  }

  const label = encodeURIComponent(productName?.slice(0, 20) || "Product");
  const color = CATEGORY_COLORS.default;
  return `${PLACEHOLDER_BASE}/${size}/${color}?text=${label}`;
}

export function getProductImageFallback(size = "400x400"): string {
  return `${PLACEHOLDER_BASE}/${size}/E0E0E0/999999?text=No+Image`;
}
