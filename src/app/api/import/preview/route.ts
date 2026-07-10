import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { importRowSchema } from "@/lib/validators/import-row";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "full";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors: parseErrors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, ""),
    });

    const rows = data as Record<string, string>[];
    const validationResults = rows.map((row, index) => {
      const result = importRowSchema.safeParse(row);
      return {
        row: index + 1,
        data: row,
        valid: result.success,
        errors: result.success ? [] : result.error.issues.map((e: { message: string }) => e.message),
      };
    });

    const validCount = validationResults.filter((r) => r.valid).length;
    const errorCount = validationResults.filter((r) => !r.valid).length;

    return NextResponse.json({
      totalRows: rows.length,
      validCount,
      errorCount,
      parseErrors,
      rows: validationResults.slice(0, 100),
      mode,
    });
  } catch (error) {
    console.error("Error previewing import:", error);
    return NextResponse.json({ error: "Failed to preview file" }, { status: 500 });
  }
}
