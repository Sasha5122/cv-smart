import { NextRequest, NextResponse } from "next/server";
import { cleanupExpired } from "@/lib/cleanup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Ștergerea automată a datelor expirate — apelat zilnic de Vercel Cron
 *  (vezi vercel.json). Retenția din Termeni nu mai depinde de vizitele
 *  în panoul de admin.
 *
 *  Securitate: când CRON_SECRET e setat în Vercel, cererile de cron vin
 *  cu Authorization: Bearer <secret> — orice altceva e respins. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
  }

  try {
    const deleted = await cleanupExpired();
    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    console.error("cron cleanup:", err);
    return NextResponse.json({ error: "Curățenia a eșuat" }, { status: 500 });
  }
}
