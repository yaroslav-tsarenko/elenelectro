import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const headers = [
      "id", "title", "description", "availability", "condition",
      "price", "link", "image_link", "brand", "gtin",
    ];

    const rows = products.map((product) => [
      product.id,
      product.name,
      (product.description || product.name).replace(/,/g, " "),
      product.quantity > 0 ? "in stock" : "out of stock",
      product.condition,
      `${Number(product.price).toFixed(2)} EUR`,
      `${siteUrl}/en/product/${product.slug}`,
      product.images[0]?.url || "",
      product.brand || "",
      product.gtin || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=facebook-feed.csv",
      },
    });
  } catch (error) {
    console.error("Error generating Facebook feed:", error);
    return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
  }
}
