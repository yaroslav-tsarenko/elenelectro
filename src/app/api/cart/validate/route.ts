import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: { id: true, price: true, quantity: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const errors: string[] = [];
    const validItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} is no longer available`);
        return null;
      }
      if (product.quantity < item.quantity) {
        errors.push(`Only ${product.quantity} of "${product.name}" available`);
        return { ...item, quantity: product.quantity, price: Number(product.price) };
      }
      return { ...item, price: Number(product.price) };
    }).filter(Boolean);

    return NextResponse.json({ valid: errors.length === 0, errors, items: validItems });
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
