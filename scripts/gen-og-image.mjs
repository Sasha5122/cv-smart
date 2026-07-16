// Generează public/og-image.png (1200×630) — cardul de partajare social.
import sharp from "sharp";

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#edeae2"/>
  <!-- logo: container portocaliu cu CV + săgeată -->
  <rect x="80" y="88" width="96" height="96" rx="22" fill="#f45a27"/>
  <text x="128" y="152" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#ffffff" text-anchor="middle">CV</text>
  <path d="M 160 108 L 176 92 M 176 92 h -14 M 176 92 v 14" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
  <text x="200" y="152" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#141413">CVexpres</text>

  <text x="80" y="320" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#141413">Garantăm un CV</text>
  <text x="80" y="406" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#141413">profesionist,</text>
  <text x="80" y="492" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#f45a27">gata în 10 minute</text>

  <text x="80" y="566" font-family="Arial, sans-serif" font-size="30" font-weight="600" fill="#57534e">Dezvoltat și optimizat special pentru piața din România · 49 RON, plată unică</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og-image.png");
console.log("public/og-image.png generat");
