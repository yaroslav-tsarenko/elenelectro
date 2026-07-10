import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { action, productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    switch (action) {
      case "delete":
        await prisma.product.deleteMany({ where: { id: { in: productIds } } });
        break;
      case "activate":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "ACTIVE" },
        });
        break;
      case "archive":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "ARCHIVED" },
        });
        break;
      case "draft":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "DRAFT" },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: productIds.length });
  } catch (error) {
    console.error("Error in bulk action:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
