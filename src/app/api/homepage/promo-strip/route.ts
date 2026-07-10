import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.promoStripItem.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching promo strip items:", error);
    return NextResponse.json({ error: "Failed to fetch promo strip items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const item = await prisma.promoStripItem.create({
      data: body,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating promo strip item:", error);
    return NextResponse.json({ error: "Failed to create promo strip item" }, { status: 500 });
  }
}
