import type { MetadataRoute } from "next";
import { LEGAL } from "@/lib/legal-config";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || LEGAL.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/creare-cv`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pret`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/termeni`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/confidentialitate`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/refund`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
