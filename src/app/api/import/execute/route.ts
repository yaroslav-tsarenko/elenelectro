import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/utils/slugify";
import { importRowSchema } from "@/lib/validators/import-row";

function parseCharacteristics(raw: string | undefined): Record<string, Record<string, string>> | undefined {
  if (!raw) return undefined;
  const result: Record<string, Record<string, string>> = {};
  const pairs = raw.split("|");
  for (const pair of pairs) {
    const groupSep = pair.indexOf(">>");
    if (groupSep !== -1) {
      const group = pair.substring(0, groupSep).trim();
      const rest = pair.substring(groupSep + 2);
      const colonIdx = rest.indexOf(":");
      if (colonIdx !== -1) {
        const key = rest.substring(0, colonIdx).trim();
        const value = rest.substring(colonIdx + 1).trim();
        if (!result[group]) result[group] = {};
        result[group][key] = value;
      }
    } else {
      const colonIdx = pair.indexOf(":");
      if (colonIdx !== -1) {
        const key = pair.substring(0, colonIdx).trim();
        const value = pair.substring(colonIdx + 1).trim();
        if (!result["General"]) result["General"] = {};
        result["General"][key] = value;
      }
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

async function findOrCreateCategoryChain(
  category?: string,
  subCategory?: string,
  subSubCategory?: string,
): Promise<string | undefined> {
  if (!category) return undefined;

  let parentId: string | undefined;

  const catSlug = slugify(category);
  const cat = await prisma.category.upsert({
    where: { slug: catSlug },
    update: {},
    create: { name: category, slug: catSlug },
  });
  parentId = cat.id;

  if (subCategory) {
    const subSlug = slugify(`${category}-${subCategory}`);
    const sub = await prisma.category.upsert({
      where: { slug: subSlug },
      update: {},
      create: { name: subCategory, slug: subSlug, parentId },
    });
    parentId = sub.id;

    if (subSubCategory) {
      const subSubSlug = slugify(`${category}-${subCategory}-${subSubCategory}`);
      const subSub = await prisma.category.upsert({
        where: { slug: subSubSlug },
        update: {},
        create: { name: subSubCategory, slug: subSubSlug, parentId },
      });
      parentId = subSub.id;
    }
  }

  return parentId;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { rows, mode } = await request.json();

    const job = await prisma.importJob.create({
      data: {
        fileName: "import",
        userId: user.id,
        totalRows: rows.length,
        status: "PROCESSING",
      },
    });

    let processed = 0;
    let errors = 0;
    const errorLog: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const validated = importRowSchema.parse(rows[i]);
        const characteristics = parseCharacteristics(validated.characteristics);
        const ean = validated.ean || undefined;

        if (mode === "price") {
          await prisma.product.update({
            where: { sku: validated.sku },
            data: {
              price: validated.price,
              comparePrice: validated.comparePrice,
            },
          });
        } else if (mode === "stock") {
          await prisma.product.update({
            where: { sku: validated.sku },
            data: { quantity: validated.quantity },
          });
        } else {
          const categoryId = await findOrCreateCategoryChain(
            validated.category,
            validated.subCategory,
            validated.subSubCategory,
          );

          const productData = {
            name: validated.name,
            price: validated.price,
            comparePrice: validated.comparePrice,
            quantity: validated.quantity,
            description: validated.description,
            shortDescription: validated.shortDescription,
            brand: validated.brand,
            status: validated.status,
            gtin: validated.gtin,
            ean,
            mpn: validated.mpn,
            googleCategory: validated.googleCategory,
            condition: validated.condition,
            characteristics: characteristics ?? undefined,
          };

          const product = await prisma.product.upsert({
            where: { sku: validated.sku },
            update: productData,
            create: {
              ...productData,
              slug: slugify(validated.name),
              sku: validated.sku,
              status: validated.status || "DRAFT",
              condition: validated.condition || "new",
            },
          });

          if (categoryId) {
            await prisma.productCategory.upsert({
              where: {
                productId_categoryId: {
                  productId: product.id,
                  categoryId,
                },
              },
              update: {},
              create: { productId: product.id, categoryId },
            });
          }
        }
        processed++;
      } catch (err) {
        errors++;
        errorLog.push({
          row: i + 1,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        processed,
        errors,
        errorLog: errorLog.length > 0 ? errorLog : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      processed,
      errors,
      errorLog,
    });
  } catch (error) {
    console.error("Error executing import:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
