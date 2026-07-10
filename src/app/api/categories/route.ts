import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils/slugify";

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get("flat") === "true";
    const includeEmpty = searchParams.get("includeEmpty") === "true";

    if (flat) {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });
      return NextResponse.json(categories);
    }

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { name: "asc" },
          include: {
            _count: { select: { products: true } },
            children: {
              orderBy: { name: "asc" },
              include: {
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
    });

    function subtreeCount(cat: any): number {
      const own = cat._count?.products || 0;
      const childSum = (cat.children || []).reduce((s: number, c: any) => s + subtreeCount(c), 0);
      return own + childSum;
    }

    function pruneEmpty(cats: any[]): any[] {
      return cats
        .filter((c) => subtreeCount(c) > 0)
        .map((c) => ({
          ...c,
          children: c.children ? pruneEmpty(c.children) : [],
        }));
    }

    return NextResponse.json(includeEmpty ? categories : pruneEmpty(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    const slug = validated.parentId
      ? await (async () => {
          const parent = await prisma.category.findUnique({ where: { id: validated.parentId! }, select: { slug: true } });
          return parent ? slugify(`${parent.slug}-${validated.name}`) : slugify(validated.name);
        })()
      : slugify(validated.name);

    const category = await prisma.category.create({
      data: { ...validated, slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
