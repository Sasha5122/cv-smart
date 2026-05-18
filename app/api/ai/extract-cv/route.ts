import { NextRequest, NextResponse } from "next/server";
import { extractJSON } from "@/lib/ai/client";
import type { CVData } from "@/lib/types/cv";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let text = pastedText ?? "";
    if (file) {
      text = await extractText(file);
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Nu există text de extras" }, { status: 400 });
    }

    const extracted = await extractJSON<Partial<CVData>>({
      system: `Ești un extractor de date din CV-uri.
Extrage datele din textul CV-ului și returnează JSON structurat.

Format strict JSON (fără text suplimentar):
{
  "personal": {"firstName": "", "lastName": "", "phone": "", "email": "", "city": "", "county": ""},
  "education": [{"level": "", "institution": "", "field": "", "years": "", "thesis": ""}],
  "courses": [{"name": "", "provider": "", "year": ""}],
  "experience": [{"company": "", "location": "", "title": "", "period": "", "responsibilities": [], "achievements": []}],
  "skills": [{"name": "", "source": "extras din CV"}],
  "languages": [{"name": "", "level": ""}],
  "license": {"hasLicense": false, "categories": []},
  "qualifications": "",
  "hobbies": []
}

Dacă o informație lipsește, omite câmpul sau lasă string gol. Nu inventa date.`,
      userMessage: `CV text:\n\n${text.slice(0, 8000)}`,
      fallback: {},
    });

    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Extract CV error:", error);
    return NextResponse.json({ error: "Eroare la extragere" }, { status: 500 });
  }
}
