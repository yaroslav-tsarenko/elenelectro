import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { uploadToR2, isR2Configured, deleteFromR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // Vercel serverless body limit is ~4.5MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("[images/upload] Failed to parse formData", err);
      return NextResponse.json(
        { error: "Request body too large or malformed. Try uploading fewer/smaller images (each < 4MB)." },
        { status: 413 },
      );
    }

    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    let totalSize = 0;
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, AVIF, GIF` },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB per file.` },
          { status: 413 },
        );
      }
      totalSize += file.size;
    }
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        {
          error: `Total upload size ${(totalSize / 1024 / 1024).toFixed(1)}MB exceeds ~4MB. Upload images one at a time or compress them.`,
        },
        { status: 413 },
      );
    }

    const maxSort = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    let nextSort = (maxSort?.sortOrder ?? -1) + 1;

    const uploaded: { id: string; url: string; alt: string | null; sortOrder: number }[] = [];

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME." },
        { status: 500 },
      );
    }

    for (const file of files) {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const url = await uploadToR2(buffer, fileName, file.type, "products");

      const image = await prisma.productImage.create({
        data: {
          url,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          sortOrder: nextSort++,
          productId: id,
        },
      });

      uploaded.push(image);
    }

    return NextResponse.json({ images: uploaded });
  } catch (error) {
    console.error("Error uploading product images:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await params;
    const { imageId } = await request.json();

    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (isR2Configured() && image.url.startsWith("http")) {
      try {
        await deleteFromR2(image.url);
      } catch {
        // continue even if R2 delete fails
      }
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product image:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
