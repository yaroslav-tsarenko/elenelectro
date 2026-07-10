import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(50),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  trackInventory: z.boolean().default(true),
  quantity: z.coerce.number().int().min(0).default(0),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().min(0).optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  brand: z.string().optional(),
  gtin: z.string().optional(),
  ean: z.string().regex(/^\d{13}$/, "EAN must be exactly 13 digits").optional().or(z.literal("")),
  mpn: z.string().optional(),
  characteristics: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  googleCategory: z.string().optional(),
  condition: z.enum(["new", "refurbished", "used"]).default("new"),
  categoryIds: z.array(z.string()).optional(),
});

export const productVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().min(0).optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(0),
  options: z.record(z.string(), z.string()),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
