import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const tab = await prisma.homepageTab.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(tab);
  } catch (error) {
    console.error("Error updating tab:", error);
    return NextResponse.json({ error: "Failed to update tab" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.homepageTab.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tab:", error);
    return NextResponse.json({ error: "Failed to delete tab" }, { status: 500 });
  }
}
