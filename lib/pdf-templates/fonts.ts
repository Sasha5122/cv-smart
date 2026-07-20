import { Font } from "@react-pdf/renderer";
import path from "path";

/**
 * Fonturile PDF sunt fișiere LOCALE (lib/pdf-templates/fonts/*.ttf) —
 * fonturile complete Lato de la foundry, cu toate diacriticele românești
 * (ă â î ș ț), verificate cu scripts/check-fonts.mjs.
 *
 * NU folosi URL-uri Google Fonts aici: subseturile gstatic sunt versionate
 * și expiră (404 la generare → bug istoric), iar unele nu conțin ș/ț.
 */

const FONTS_DIR = path.join(process.cwd(), "lib", "pdf-templates", "fonts");

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Lato",
    fonts: [
      { src: path.join(FONTS_DIR, "Lato-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONTS_DIR, "Lato-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(FONTS_DIR, "Lato-Bold.ttf"), fontWeight: 700 },
      { src: path.join(FONTS_DIR, "Lato-Black.ttf"), fontWeight: 900 },
    ],
  });

  // serif pentru template-ul „Elegant"
  Font.register({
    family: "PT Serif",
    fonts: [
      { src: path.join(FONTS_DIR, "PTSerif-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONTS_DIR, "PTSerif-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(FONTS_DIR, "PTSerif-Bold.ttf"), fontWeight: 700 },
    ],
  });

  // sans geometric pentru numele mari din template-urile noi
  // (Manhattan, Cobalt, Sapphire etc.) — diacriticele RO verificate cu check-fonts
  Font.register({
    family: "Montserrat",
    fonts: [
      { src: path.join(FONTS_DIR, "Montserrat-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONTS_DIR, "Montserrat-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONTS_DIR, "Montserrat-Bold.ttf"), fontWeight: 700 },
      { src: path.join(FONTS_DIR, "Montserrat-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });

  // fără despărțire automată în silabe — cuvintele rămân întregi
  Font.registerHyphenationCallback((word) => [word]);
}
