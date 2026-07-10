import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const links = await prisma.utilityLink.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching utility links:", error);
    return NextResponse.json({ error: "Failed to fetch utility links" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const link = await prisma.utilityLink.create({
      data: body,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating utility link:", error);
    return NextResponse.json({ error: "Failed to create utility link" }, { status: 500 });
  }
}
