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
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
