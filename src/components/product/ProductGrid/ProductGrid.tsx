"use client";

import { ProductCard } from "@/components/product/ProductCard/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  quantity: number;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string } }[];
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 min-w-0">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          sku={product.sku}
          price={Number(product.price)}
          comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
          imageUrl={product.images[0]?.url}
          category={product.categories?.[0]?.category?.name}
          quantity={product.quantity}
        />
      ))}
    </div>
  );
}
