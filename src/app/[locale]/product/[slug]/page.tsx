import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs/ProductTabs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { JsonLd } from "@/components/shared/SEO/JsonLd";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getCategoryChain(categoryId: string): Promise<{ name: string; slug: string }[]> {
  const chain: { name: string; slug: string }[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const cat: { name: string; slug: string; parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentId },
        select: { name: true, slug: true, parentId: true },
      });
    if (!cat) break;
    chain.unshift({ name: cat.name, slug: cat.slug });
    currentId = cat.parentId;
  }

  return chain;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true, shortDescription: true },
  });

  if (!product) return {};

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.name,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      variants: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status === "ARCHIVED") notFound();

  const primaryCategory = product.categories[0]?.category;
  const categoryChain = primaryCategory
    ? await getCategoryChain(primaryCategory.id)
    : [];

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
    : 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const characteristics = product.characteristics as Record<string, Record<string, string>> | null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || product.name,
    sku: product.sku,
    gtin13: product.ean || product.gtin || undefined,
    image: product.images[0]?.url,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "EUR",
      availability: product.quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/en/product/${product.slug}`,
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount,
      },
    }),
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    ...categoryChain.map((cat) => ({
      label: cat.name,
      href: `/catalog/${cat.slug}`,
    })),
    { label: product.name },
  ];

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <JsonLd data={jsonLd} />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mt-2 items-start">
        <div className="static md:sticky md:top-[calc(var(--header-height)+1rem)]">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <ProductInfo
          id={product.id}
          name={product.name}
          slug={product.slug}
          sku={product.sku}
          price={Number(product.price)}
          comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
          quantity={product.quantity}
          shortDescription={product.shortDescription}
          description={product.description}
          brand={product.brand}
          condition={product.condition}
          lowStockAlert={product.lowStockAlert}
          imageUrl={product.images[0]?.url}
          ean={product.ean}
          reviewCount={reviewCount}
          avgRating={avgRating}
          categoryPath={categoryChain}
        />
      </div>

      <ProductTabs
        description={product.description}
        characteristics={characteristics}
        reviews={product.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
