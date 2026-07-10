import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const item = await prisma.promoStripItem.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating promo strip item:", error);
    return NextResponse.json({ error: "Failed to update promo strip item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.promoStripItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promo strip item:", error);
    return NextResponse.json({ error: "Failed to delete promo strip item" }, { status: 500 });
  }
}
