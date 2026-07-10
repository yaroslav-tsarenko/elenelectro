import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string; locale: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { select: { id: true, slug: true } },
    },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const productCategories = await prisma.productCategory.findMany({
    where: { categoryId: { in: categoryIds } },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          categories: { include: { category: { select: { name: true } } } },
        },
      },
    },
  });

  const seen = new Set<string>();
  const products = productCategories
    .map((pc) => pc.product)
    .filter((p) => {
      if (p.status !== "ACTIVE" || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1rem 3rem", overflowWrap: "anywhere" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalog" },
          { label: category.name },
        ]}
      />

      <h1 style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem", wordBreak: "break-word" }}>
        {category.name}
      </h1>

      {category.description && (
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          {category.description}
        </p>
      )}

      <ProductGrid products={products as unknown as Parameters<typeof ProductGrid>[0]["products"]} />
    </div>
  );
}
