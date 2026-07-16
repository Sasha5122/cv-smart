import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fonturile PDF sunt citite de pe disc la runtime (Font.register cu
  // path.join) — Vercel nu le-ar include în bundle-ul serverless fără
  // această declarație explicită. Fără ea, generarea PDF crapă în producție.
  outputFileTracingIncludes: {
    "/api/pdf/[sessionId]": ["./lib/pdf-templates/fonts/**"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // site-ul nu are voie să fie încadrat în iframe pe alte site-uri
          // (protecție clickjacking — inclusiv pentru pagina de admin)
          { key: "X-Frame-Options", value: "DENY" },
          // browserul nu are voie să „ghicească" tipul fișierelor
          { key: "X-Content-Type-Options", value: "nosniff" },
          // nu trimitem URL-uri complete către site-uri externe
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HTTPS obligatoriu 2 ani, inclusiv subdomenii
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // dezactivăm API-uri de browser pe care nu le folosim
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
