import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const link = await prisma.utilityLink.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error updating utility link:", error);
    return NextResponse.json({ error: "Failed to update utility link" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.utilityLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting utility link:", error);
    return NextResponse.json({ error: "Failed to delete utility link" }, { status: 500 });
  }
}
