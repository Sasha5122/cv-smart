import { NextResponse } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

/** Link partajabil: /en setează limba engleză și trimite la pagina principală. */
export function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), { status: 307 });
  res.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" });
  return res;
}
