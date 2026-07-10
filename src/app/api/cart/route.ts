import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        quantity: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching cart products:", error);
    return NextResponse.json({ error: "Failed to fetch cart products" }, { status: 500 });
  }
}
