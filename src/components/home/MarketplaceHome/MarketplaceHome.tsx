"use client";

import { TopBar } from "../TopBar/TopBar";
import { PromoStrip } from "../PromoStrip/PromoStrip";
import { CategorySidebar } from "../CategorySidebar/CategorySidebar";
import { HorizontalTabs } from "../HorizontalTabs/HorizontalTabs";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import { PromoBannerGrid } from "../PromoBannerGrid/PromoBannerGrid";
import { BrandStrip } from "../BrandStrip/BrandStrip";
import { ProductSection } from "../ProductSection/ProductSection";
import { CategoryShowcase } from "../CategoryShowcase/CategoryShowcase";
import { SaleStrip } from "../SaleStrip/SaleStrip";
import { DealOfTheDay } from "../DealOfTheDay/DealOfTheDay";
import { NewsletterBanner } from "../NewsletterBanner/NewsletterBanner";
import { TrustStrip } from "../TrustStrip/TrustStrip";
import type { HomepageProduct, CategorySection, BrandSection } from "@/lib/homepage-products";

interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
}

interface SectionData {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  filterType: string;
  categorySlug?: string | null;
  maxProducts: number;
  viewAllUrl?: string | null;
  viewAllLabel: string;
  bgStyle: string;
  columns: number;
}

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface UtilityLinkData {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface PromoStripData {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

interface CategoryShowcaseItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  data: {
    heroSlides: BannerData[];
    dealCards: BannerData[];
    promoSmall: BannerData[];
    promoWide: BannerData[];
    brands: BrandData[];
    sections: SectionData[];
    tabs: TabData[];
    utilityLinks: UtilityLinkData[];
    promoStripItems: PromoStripData[];
    sectionProducts: Record<string, HomepageProduct[]>;
    categories: { id: string; name: string; slug: string; _count: { products: number } }[];
    featuredProducts: HomepageProduct[];
    saleProducts: HomepageProduct[];
    newProducts: HomepageProduct[];
    popularProducts: HomepageProduct[];
    categorySections: CategorySection[];
    brandSections: BrandSection[];
    categoryShowcase: CategoryShowcaseItem[];
  };
}

export function MarketplaceHome({ data }: Props) {
  const {
    heroSlides, dealCards, promoSmall, promoWide,
    brands, sections, tabs, utilityLinks, promoStripItems,
    sectionProducts, featuredProducts, saleProducts, newProducts,
    popularProducts, categorySections, brandSections, categoryShowcase,
  } = data;

  return (
    <div className="bg-surface-1 min-h-screen">
      <TopBar links={utilityLinks} />
      <PromoStrip items={promoStripItems} />

      <div className="max-w-[1400px] mx-auto px-4 pt-4 pb-12 max-sm:px-2 max-sm:pt-3 max-sm:pb-8">
        <div className="flex gap-4 items-start">
          <div className="hidden lg:block sticky top-20">
            <CategorySidebar />
          </div>

          <div className="flex-1 min-w-0">
            <div className="hidden max-lg:block mb-3">
              <CategorySidebar />
            </div>

            {tabs.length > 0 && <HorizontalTabs tabs={tabs} />}
            <HeroCarousel slides={heroSlides} deals={dealCards} />
            <PromoBannerGrid smallBanners={promoSmall} wideBanners={promoWide} />

            {/* Most Popular Products */}
            {popularProducts.length > 0 && (
              <ProductSection
                title="Most Popular"
                subtitle="Top products by availability"
                products={popularProducts}
                viewAllHref="/catalog?sort=popular"
                viewAllLabel="View all popular"
                bg="white"
                columns={5}
              />
            )}

            {/* Top categories by product count */}
            {categorySections.slice(0, 3).map((cs, i) => (
              <ProductSection
                key={cs.category.id}
                title={cs.category.name}
                subtitle={`${cs.products.length}+ products`}
                products={cs.products}
                tabs={cs.subcategoryTabs}
                viewAllHref={`/catalog/${cs.category.slug}`}
                viewAllLabel={`All ${cs.category.name}`}
                bg={i % 2 === 1 ? "gray" : "white"}
                columns={5}
              />
            ))}

            {/* Hot Deals - horizontal scrollable strip */}
            <SaleStrip products={saleProducts} />

            {/* Trust / Guarantee Strip */}
            <TrustStrip />

            {/* Deal of the Day */}
            {saleProducts.length > 0 && (
              <DealOfTheDay product={saleProducts[0]} />
            )}

            {/* 3 more top categories after deal */}
            {categorySections.slice(3, 6).map((cs, i) => (
              <ProductSection
                key={cs.category.id}
                title={cs.category.name}
                subtitle={`${cs.products.length}+ products`}
                products={cs.products}
                tabs={cs.subcategoryTabs}
                viewAllHref={`/catalog/${cs.category.slug}`}
                viewAllLabel={`All ${cs.category.name}`}
                bg={i % 2 === 0 ? "gray" : "white"}
                columns={5}
              />
            ))}

            {/* Brand Strip */}
            {brands.length > 0 && <BrandStrip brands={brands} />}

            {/* Admin-configured sections */}
            {sections.map((section) => {
              const products = sectionProducts[section.slug] || [];
              if (!products.length) return null;
              return (
                <ProductSection
                  key={section.id}
                  title={section.title}
                  subtitle={section.subtitle || undefined}
                  products={products}
                  viewAllHref={section.viewAllUrl || "/catalog"}
                  viewAllLabel={section.viewAllLabel}
                  bg={section.bgStyle as "white" | "gray"}
                  columns={section.columns}
                />
              );
            })}

            {/* Newsletter / Discount CTA */}
            <NewsletterBanner />

            {/* New Arrivals */}
            {newProducts.length > 0 && (
              <ProductSection
                title="New Arrivals"
                subtitle="Just landed in store"
                products={newProducts}
                viewAllHref="/catalog?sort=newest"
                viewAllLabel="View all new"
                bg="gray"
                columns={5}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
