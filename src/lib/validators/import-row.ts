import { z } from "zod";

export const importRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().min(0).optional().nullable(),
  quantity: z.coerce.number().int().min(0).optional().default(0),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  subSubCategory: z.string().optional(),
  brand: z.string().optional(),
  weight: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional().default("DRAFT"),
  imageUrl: z.string().url().optional(),
  gtin: z.string().optional(),
  ean: z.string().regex(/^\d{13}$/, "EAN must be exactly 13 digits").optional().or(z.literal("")),
  mpn: z.string().optional(),
  googleCategory: z.string().optional(),
  condition: z.enum(["new", "refurbished", "used"]).optional().default("new"),
  characteristics: z.string().optional(),
});

export const priceUpdateRowSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().min(0).optional().nullable(),
});

export const stockUpdateRowSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.coerce.number().int().min(0),
});

export type ImportRow = z.infer<typeof importRowSchema>;
