import { NextRequest, NextResponse } from "next/server";
import { updateSessionCVData } from "@/lib/db/queries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { cv_data } = await req.json();
    await updateSessionCVData(id, cv_data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
