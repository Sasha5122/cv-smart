import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, isValidPassword } from "@/lib/admin-auth";
import { checkRateLimit, peekRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

export const dynamic = "force-dynamic";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

/** Login admin: parolă corectă → cookie httpOnly valabil 24h.
 *  Anti-brute-force: maxim 5 încercări EȘUATE per IP la 15 minute
 *  (login-urile reușite nu consumă bugetul). */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const stillAllowed = await peekRateLimit(ip, "admin-login", MAX_FAILURES, WINDOW_MS);
    if (!stillAllowed) {
      return NextResponse.json(
        { error: "Prea multe încercări. Așteaptă câteva minute." },
        { status: 429 }
      );
    }
    const { password } = await readJsonLimited<{ password?: string }>(req, BODY_LIMITS.TINY);
    if (!isValidPassword(password)) {
      // doar eșecurile consumă bugetul
      await checkRateLimit(ip, "admin-login", MAX_FAILURES, WINDOW_MS);
      return NextResponse.json({ error: "Parolă incorectă." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, adminToken(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
}
