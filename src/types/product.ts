export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | string | null;
  quantity: number;
  options: Record<string, string>;
}

export interface ProductCategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  status: string;
  isFeatured: boolean;
  quantity: number;
  images: ProductImage[];
  categories: ProductCategory[];
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  shortDescription: string | null;
  costPrice: number | null;
  trackInventory: boolean;
  lowStockAlert: number;
  weight: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  brand: string | null;
  gtin: string | null;
  ean: string | null;
  mpn: string | null;
  characteristics: Record<string, Record<string, string>> | null;
  googleCategory: string | null;
  condition: string;
  metadata: Record<string, unknown> | null;
  variants: ProductVariant[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null };
  }[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name-asc";
  page?: number;
}
