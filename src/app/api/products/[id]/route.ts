import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators/product";
import { slugify } from "@/lib/utils/slugify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        categories: { include: { category: true } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = productSchema.partial().parse(body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.name) {
      updateData.slug = slugify(validated.name);
    }

    delete updateData.categoryIds;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        categories: { include: { category: true } },
        variants: true,
      },
    });

    if (validated.categoryIds) {
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      await prisma.productCategory.createMany({
        data: validated.categoryIds.map((categoryId) => ({
          productId: id,
          categoryId,
        })),
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
