import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop grand (max 10 Mo)" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type;
  const filename = file.name;

  // Images → base64 for vision models
  if (mimeType.startsWith("image/")) {
    const base64 = buffer.toString("base64");
    return NextResponse.json({
      type: "image",
      filename,
      mimeType,
      base64,
      content: null,
      size: file.size,
    });
  }

  // PDF
  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
      const parsed = await pdfParse(buffer);
      return NextResponse.json({
        type: "pdf",
        filename,
        mimeType,
        content: parsed.text.slice(0, 50000), // limit chars
        pages: parsed.numpages,
        size: file.size,
      });
    } catch {
      return NextResponse.json({ error: "Impossible de lire ce PDF" }, { status: 422 });
    }
  }

  // Text files (code, markdown, csv, json, xml, etc.)
  const textTypes = ["text/", "application/json", "application/xml", "application/javascript", "application/typescript"];
  const textExts = [".txt", ".md", ".csv", ".json", ".xml", ".js", ".ts", ".tsx", ".jsx", ".py", ".java", ".cpp", ".c", ".go", ".rs", ".html", ".css", ".sql", ".sh", ".yaml", ".yml", ".toml", ".env"];
  const isText = textTypes.some((t) => mimeType.startsWith(t)) || textExts.some((e) => filename.endsWith(e));

  if (isText) {
    const content = buffer.toString("utf-8").slice(0, 50000);
    return NextResponse.json({ type: "text", filename, mimeType, content, size: file.size });
  }

  return NextResponse.json({ error: `Type de fichier non supporté: ${mimeType}` }, { status: 415 });
}
