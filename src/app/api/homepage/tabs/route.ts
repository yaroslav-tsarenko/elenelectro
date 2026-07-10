import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tabs = await prisma.homepageTab.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(tabs);
  } catch (error) {
    console.error("Error fetching tabs:", error);
    return NextResponse.json({ error: "Failed to fetch tabs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tab = await prisma.homepageTab.create({
      data: body,
    });

    return NextResponse.json(tab, { status: 201 });
  } catch (error) {
    console.error("Error creating tab:", error);
    return NextResponse.json({ error: "Failed to create tab" }, { status: 500 });
  }
}
