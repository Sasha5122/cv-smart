import type { MetadataRoute } from "next";
import { LEGAL } from "@/lib/legal-config";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || LEGAL.siteUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
