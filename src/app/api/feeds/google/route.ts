import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const items = products
      .map((product) => {
        const imageUrl = product.images[0]?.url || "";
        const price = `${Number(product.price).toFixed(2)} EUR`;
        const availability = product.quantity > 0 ? "in_stock" : "out_of_stock";

        return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <title>${escapeXml(product.name)}</title>
      <description>${escapeXml(product.description || product.name)}</description>
      <link>${siteUrl}/en/product/${escapeXml(product.slug)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${price}</g:price>
      ${product.comparePrice ? `<g:sale_price>${Number(product.price).toFixed(2)} EUR</g:sale_price>` : ""}
      <g:availability>${availability}</g:availability>
      <g:condition>${escapeXml(product.condition)}</g:condition>
      ${product.brand ? `<g:brand>${escapeXml(product.brand)}</g:brand>` : ""}
      ${product.gtin ? `<g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ""}
      ${product.mpn ? `<g:mpn>${escapeXml(product.mpn)}</g:mpn>` : ""}
      ${product.googleCategory ? `<g:google_product_category>${escapeXml(product.googleCategory)}</g:google_product_category>` : ""}
      ${product.weight ? `<g:shipping_weight>${Number(product.weight)} kg</g:shipping_weight>` : ""}
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>My Store Product Feed</title>
    <link>${siteUrl}</link>
    <description>Product feed for Google Merchant Center</description>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error generating Google feed:", error);
    return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
