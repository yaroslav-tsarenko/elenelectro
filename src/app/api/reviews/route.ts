import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const pending = searchParams.get("pending") === "true";

    const where = {
      ...(productId ? { productId } : {}),
      ...(pending ? { isApproved: false } : {}),
    };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: validated.productId,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isApproved } = await request.json();

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
