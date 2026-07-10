import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "name", "sku", "price", "comparePrice", "quantity", "description",
    "shortDescription", "category", "subCategory", "subSubCategory",
    "brand", "weight", "status", "imageUrl", "gtin", "ean", "mpn",
    "googleCategory", "condition", "characteristics",
  ];

  const sampleRow = [
    "Sample Product", "SKU-001", "29.99", "39.99", "100",
    "A great product with detailed description", "Short product summary",
    "Electronics", "Smartphones", "Android Phones",
    "BrandName", "0.5", "ACTIVE", "", "", "4751234567890", "", "", "new",
    "Dimensions>>Height:703 mm|Dimensions>>Width:603 mm|Connection>>Rated current:125 A|Equipment>>Number of rails:8|Materials>>Colour:Pure white",
  ];

  const csv = [headers.join(","), sampleRow.join(",")].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=import-template.csv",
    },
  });
}
