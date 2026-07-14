import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    const brands = products.map((p) => p.brand).filter(Boolean) as string[];
    return NextResponse.json(brands, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=600",
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
