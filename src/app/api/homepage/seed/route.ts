import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // ── Utility Links ──────────────────────────────────
    const utilityLinks = [
      { label: "About Us", linkUrl: "/about", icon: "Info", position: "left", sortOrder: 0 },
      { label: "Payment & Delivery", linkUrl: "/payment-delivery", icon: "Truck", position: "left", sortOrder: 1 },
      { label: "Returns & Warranty", linkUrl: "/returns", icon: "RotateCcw", position: "left", sortOrder: 2 },
      { label: "FAQ", linkUrl: "/faq", icon: "HelpCircle", position: "left", sortOrder: 3 },
      { label: "Order Info", linkUrl: "/order-info", icon: "Package", position: "left", sortOrder: 4 },
      { label: "Contacts", linkUrl: "/contacts", icon: "Phone", position: "right", sortOrder: 5 },
    ];

    for (const link of utilityLinks) {
      await prisma.utilityLink.upsert({
        where: { id: `seed-utility-${link.sortOrder}` },
        update: link,
        create: { id: `seed-utility-${link.sortOrder}`, ...link },
      });
    }

    // ── Promo Strip Items ──────────────────────────────
    const promoStripItems = [
      { icon: "Truck", title: "Free Delivery", subtitle: "On orders over €100", sortOrder: 0 },
      { icon: "RotateCcw", title: "Easy Returns", subtitle: "30-day return policy", sortOrder: 1 },
      { icon: "Shield", title: "2-Year Warranty", subtitle: "Official guarantee", sortOrder: 2 },
      { icon: "Gift", title: "Gift Cards", subtitle: "Perfect for any occasion", sortOrder: 3 },
      { icon: "Award", title: "Premium Quality", subtitle: "Certified products", sortOrder: 4 },
      { icon: "Headphones", title: "24/7 Support", subtitle: "Always here to help", sortOrder: 5 },
    ];

    for (const item of promoStripItems) {
      await prisma.promoStripItem.upsert({
        where: { id: `seed-promo-${item.sortOrder}` },
        update: item,
        create: { id: `seed-promo-${item.sortOrder}`, ...item },
      });
    }

    // ── Homepage Tabs ──────────────────────────────────
    const tabs = [
      { label: "Offers", icon: "Flame", linkUrl: "/offers", color: "#E53935", sortOrder: 0 },
      { label: "Apple Store", icon: "Apple", linkUrl: "/brands/apple", color: "#333333", sortOrder: 1 },
      { label: "Dyson Store", icon: "Wind", linkUrl: "/brands/dyson", color: "#6B21A8", sortOrder: 2 },
      { label: "Get Bonus", icon: "Star", linkUrl: "/bonus", color: "#F59E0B", sortOrder: 3 },
      { label: "Mobile App", icon: "Smartphone", linkUrl: "/app", color: "#2563EB", sortOrder: 4 },
      { label: "Gaming World", icon: "Gamepad2", linkUrl: "/gaming", color: "#DC2626", sortOrder: 5 },
      { label: "Tips", icon: "Lightbulb", linkUrl: "/tips", color: "#16A34A", sortOrder: 6 },
      { label: "New Arrivals", icon: "Sparkles", linkUrl: "/new-arrivals", color: "#7C3AED", sortOrder: 7 },
      { label: "Outlet", icon: "Tag", linkUrl: "/outlet", color: "#EA580C", sortOrder: 8 },
    ];

    for (const tab of tabs) {
      await prisma.homepageTab.upsert({
        where: { id: `seed-tab-${tab.sortOrder}` },
        update: tab,
        create: { id: `seed-tab-${tab.sortOrder}`, ...tab },
      });
    }

    // ── Hero Slides (Banners type HERO) ────────────────
    const heroSlides = [
      {
        type: "HERO" as const,
        title: "Summer Electronics Sale",
        subtitle: "Up to 40% off on top brands",
        description: "Discover amazing deals on smartphones, laptops, and accessories. Limited time offer!",
        linkUrl: "/offers/summer-sale",
        ctaLabel: "Shop Now",
        bgColor: "#1A1A2E",
        textColor: "#ffffff",
        badgeText: "HOT DEAL",
        sortOrder: 0,
      },
      {
        type: "HERO" as const,
        title: "Smart Home Collection",
        subtitle: "Transform your living space",
        description: "Explore our curated selection of smart home devices from leading brands.",
        linkUrl: "/categories/smart-home",
        ctaLabel: "Explore",
        bgColor: "#0F3460",
        textColor: "#ffffff",
        badgeText: "NEW",
        sortOrder: 1,
      },
      {
        type: "HERO" as const,
        title: "Gaming Gear Festival",
        subtitle: "Level up your setup",
        description: "Premium gaming laptops, peripherals, and accessories at unbeatable prices.",
        linkUrl: "/gaming",
        ctaLabel: "Game On",
        bgColor: "#16213E",
        textColor: "#ffffff",
        badgeText: "GAMING",
        sortOrder: 2,
      },
    ];

    for (let i = 0; i < heroSlides.length; i++) {
      await prisma.banner.upsert({
        where: { id: `seed-hero-${i}` },
        update: heroSlides[i],
        create: { id: `seed-hero-${i}`, ...heroSlides[i] },
      });
    }

    // ── Deal Cards (Banners type DEAL_CARD) ────────────
    const dealCards = [
      {
        type: "DEAL_CARD" as const,
        title: "Wireless Earbuds Pro",
        subtitle: "Noise Cancelling",
        description: "Premium sound quality with active noise cancellation and 30-hour battery life.",
        linkUrl: "/products/wireless-earbuds-pro",
        ctaLabel: "Buy Now",
        bgColor: "#F8F9FA",
        textColor: "#1A1A2E",
        oldPrice: "$149.99",
        newPrice: "$89.99",
        discountText: "-40%",
        sortOrder: 0,
      },
      {
        type: "DEAL_CARD" as const,
        title: "4K Action Camera",
        subtitle: "Waterproof",
        description: "Capture every adventure in stunning 4K resolution. Waterproof up to 30m.",
        linkUrl: "/products/4k-action-camera",
        ctaLabel: "Buy Now",
        bgColor: "#F8F9FA",
        textColor: "#1A1A2E",
        oldPrice: "$299.99",
        newPrice: "$199.99",
        discountText: "-33%",
        sortOrder: 1,
      },
    ];

    for (let i = 0; i < dealCards.length; i++) {
      await prisma.banner.upsert({
        where: { id: `seed-deal-${i}` },
        update: dealCards[i],
        create: { id: `seed-deal-${i}`, ...dealCards[i] },
      });
    }

    // ── Small Promo Banners ────────────────────────────
    const smallPromos = [
      {
        type: "PROMO_SMALL" as const,
        title: "Smartphones",
        subtitle: "From $299",
        linkUrl: "/categories/smartphones",
        ctaLabel: "View All",
        bgColor: "#EDE9FE",
        textColor: "#5B21B6",
        sortOrder: 0,
      },
      {
        type: "PROMO_SMALL" as const,
        title: "Laptops",
        subtitle: "From $499",
        linkUrl: "/categories/laptops",
        ctaLabel: "View All",
        bgColor: "#DBEAFE",
        textColor: "#1E40AF",
        sortOrder: 1,
      },
      {
        type: "PROMO_SMALL" as const,
        title: "Accessories",
        subtitle: "From $9.99",
        linkUrl: "/categories/accessories",
        ctaLabel: "View All",
        bgColor: "#FEF3C7",
        textColor: "#92400E",
        sortOrder: 2,
      },
    ];

    for (let i = 0; i < smallPromos.length; i++) {
      await prisma.banner.upsert({
        where: { id: `seed-promo-small-${i}` },
        update: smallPromos[i],
        create: { id: `seed-promo-small-${i}`, ...smallPromos[i] },
      });
    }

    // ── Wide Promo Banner ──────────────────────────────
    const widePromo = {
      type: "PROMO_WIDE" as const,
      title: "Free Shipping Weekend",
      subtitle: "No minimum order required",
      description: "This weekend only — enjoy free shipping on all orders. No promo code needed!",
      linkUrl: "/offers/free-shipping",
      ctaLabel: "Shop Now",
      bgColor: "#ECFDF5",
      textColor: "#065F46",
      badgeText: "LIMITED TIME",
      sortOrder: 0,
    };

    await prisma.banner.upsert({
      where: { id: "seed-promo-wide-0" },
      update: widePromo,
      create: { id: "seed-promo-wide-0", ...widePromo },
    });

    // ── Brands ─────────────────────────────────────────
    const brands = [
      "Apple", "Samsung", "Sony", "LG", "Xiaomi",
      "Lenovo", "ASUS", "Dyson", "Bosch", "Philips",
      "JBL", "LEGO", "Nike", "Electrolux", "Canon",
    ];

    for (let i = 0; i < brands.length; i++) {
      const slug = brands[i].toLowerCase().replace(/\s+/g, "-");
      await prisma.brand.upsert({
        where: { id: `seed-brand-${i}` },
        update: { name: brands[i], logoUrl: `/brands/${slug}.svg`, linkUrl: `/brands/${slug}`, sortOrder: i },
        create: {
          id: `seed-brand-${i}`,
          name: brands[i],
          logoUrl: `/brands/${slug}.svg`,
          linkUrl: `/brands/${slug}`,
          sortOrder: i,
        },
      });
    }

    // ── Homepage Sections ──────────────────────────────
    const sections = [
      {
        title: "Best Deals",
        subtitle: "Save big on top products",
        slug: "best-deals",
        filterType: "onSale",
        maxProducts: 5,
        viewAllUrl: "/offers",
        viewAllLabel: "View all deals",
        bgStyle: "white",
        columns: 5,
        sortOrder: 0,
      },
      {
        title: "Popular Products",
        subtitle: "Most loved by our customers",
        slug: "popular",
        filterType: "featured",
        maxProducts: 5,
        viewAllUrl: "/popular",
        viewAllLabel: "View all",
        bgStyle: "white",
        columns: 5,
        sortOrder: 1,
      },
      {
        title: "New Arrivals",
        subtitle: "Just landed in store",
        slug: "new-arrivals",
        filterType: "newest",
        maxProducts: 5,
        viewAllUrl: "/new-arrivals",
        viewAllLabel: "View all new",
        bgStyle: "gray",
        columns: 5,
        sortOrder: 2,
      },
      {
        title: "Electronics",
        subtitle: "Top electronics picks",
        slug: "electronics",
        filterType: "category",
        categorySlug: "electronics",
        maxProducts: 5,
        viewAllUrl: "/categories/electronics",
        viewAllLabel: "View all",
        bgStyle: "white",
        columns: 5,
        sortOrder: 3,
      },
      {
        title: "Recommended for You",
        subtitle: "Based on trending items",
        slug: "recommended",
        filterType: "popular",
        maxProducts: 5,
        viewAllUrl: "/recommended",
        viewAllLabel: "View all",
        bgStyle: "white",
        columns: 5,
        sortOrder: 4,
      },
      {
        title: "Home Essentials",
        subtitle: "Everything for your home",
        slug: "home-essentials",
        filterType: "category",
        categorySlug: "home-garden",
        maxProducts: 5,
        viewAllUrl: "/categories/home-garden",
        viewAllLabel: "View all",
        bgStyle: "gray",
        columns: 5,
        sortOrder: 5,
      },
      {
        title: "All Products",
        subtitle: "Browse our full catalog",
        slug: "all-products",
        filterType: "all",
        maxProducts: 10,
        viewAllUrl: "/products",
        viewAllLabel: "View all products",
        bgStyle: "white",
        columns: 5,
        sortOrder: 6,
      },
    ];

    for (const section of sections) {
      await prisma.homepageSection.upsert({
        where: { slug: section.slug },
        update: section,
        create: section,
      });
    }

    return NextResponse.json({
      success: true,
      seeded: {
        utilityLinks: utilityLinks.length,
        promoStripItems: promoStripItems.length,
        tabs: tabs.length,
        heroSlides: heroSlides.length,
        dealCards: dealCards.length,
        smallPromos: smallPromos.length,
        widePromos: 1,
        brands: brands.length,
        sections: sections.length,
      },
    });
  } catch (error) {
    console.error("Error seeding homepage data:", error);
    return NextResponse.json({ error: "Failed to seed homepage data" }, { status: 500 });
  }
}
