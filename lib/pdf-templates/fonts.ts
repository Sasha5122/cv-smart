import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Inter",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SUc.ttf",
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: "Lato",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjxAwXjeu.ttf",
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0N7w.ttf",
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: "Playfair Display",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
        fontWeight: 700,
      },
    ],
  });
}
