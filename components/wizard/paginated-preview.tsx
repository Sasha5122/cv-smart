"use client";
import { useEffect, useRef, useState } from "react";
import { CVPreview } from "./cv-preview";
import type { CVData, TemplateId } from "@/lib/types/cv";

/** Lățimea de referință la care e „proiectat" preview-ul (px). Conținutul se
 *  randează mereu la această lățime și se SCALEAZĂ în containerul real —
 *  astfel pe telefon foaia are exact aceleași proporții text/pagină ca
 *  PDF-ul final (impresie realistă), nu text uriaș pe o foaie îngustă. */
const BASE_W = 760;
const PAGE_H = (BASE_W * 297) / 210; // înălțimea unei pagini A4 la lățimea de referință

interface Props {
  cvData: CVData;
  template?: TemplateId;
  /** testid pus pe PRIMA foaie (compatibil cu testele/screenshot-urile existente) */
  sheetTestId?: string;
}

/** Preview-ul CV-ului împărțit pe foi A4 separate — ca un PDF, fără
 *  scrollbar intern. Conținutul e măsurat la lățimea de referință și
 *  scalat; fiecare foaie afișează felia ei. Aproximează paginarea PDF. */
export function PaginatedCVPreview({ cvData, template = "classic", sheetTestId }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const meas = measureRef.current;
    if (!wrap || !meas) return;
    const update = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      setScale(w / BASE_W);
      // -6px toleranță — rotunjirile nu trebuie să creeze o foaie goală
      setPages(Math.max(1, Math.ceil((meas.scrollHeight - 6) / PAGE_H)));
    };
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(meas);
    update();
    return () => ro.disconnect();
  }, [cvData, template]);

  const sheetH = PAGE_H * scale; // înălțimea reală (scalată) a unei foi

  return (
    <div ref={wrapRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: pages }, (_, i) => (
        <div key={i} style={{ position: "relative" }}>
          <div
            data-testid={i === 0 ? sheetTestId : undefined}
            data-preview-page={i + 1}
            // paginile 2+ sunt copii vizuale decupate — invizibile pentru
            // cititoarele de ecran (conținutul complet e pe prima foaie)
            aria-hidden={i > 0}
            style={{
              position: "relative",
              width: "100%",
              height: sheetH || undefined,
              aspectRatio: sheetH ? undefined : "210 / 297",
              overflow: "hidden",
              border: "1px solid var(--hairline)",
              borderRadius: 10,
              boxShadow: "var(--shadow-lift)",
              backgroundColor: "#fff",
            }}
          >
            {/* conținutul la lățimea de referință, scalat + deplasat pe felia i;
                prima foaie servește și drept sursă de măsurare */}
            <div
              ref={i === 0 ? measureRef : undefined}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: BASE_W,
                transform: `scale(${scale}) translateY(${-(i * PAGE_H)}px)`,
                transformOrigin: "top left",
              }}
            >
              <CVPreview cvData={cvData} template={template} />
            </div>
          </div>
          {pages > 1 && (
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--faint)", margin: "6px 0 0" }}>
              Pagina {i + 1} din {pages}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Varianta pentru preview-ul lateral: o singură foaie care crește cu
 *  conținutul (fără scrollbar), cu LINII DE SEPARARE acolo unde PDF-ul va
 *  rupe pagina. Conținutul e randat la lățimea de referință și scalat —
 *  proporții identice cu PDF-ul. */
export function PreviewWithPageMarks({ cvData, template = "classic" }: Omit<Props, "sheetTestId">) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentH, setContentH] = useState(0); // la lățimea de referință
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const sheet = sheetRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return;
    const update = () => {
      const w = sheet.clientWidth;
      if (!w) return;
      setScale(w / BASE_W);
      setContentH(content.scrollHeight);
      setPages(Math.max(1, Math.ceil((content.scrollHeight - 6) / PAGE_H)));
    };
    const ro = new ResizeObserver(update);
    ro.observe(sheet);
    ro.observe(content);
    update();
    return () => ro.disconnect();
  }, [cvData, template]);

  // foaia are minim o pagină A4; crește cu conținutul (scalat)
  const minH = PAGE_H * scale;
  const realH = Math.max(contentH, PAGE_H) * scale;

  return (
    <div
      ref={sheetRef}
      style={{
        position: "relative",
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        boxShadow: "var(--shadow-lift)",
        backgroundColor: "#fff",
        overflow: "hidden",
        height: contentH ? realH : undefined,
        minHeight: contentH ? undefined : minH || undefined,
        aspectRatio: contentH || minH ? undefined : "210 / 297",
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: BASE_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CVPreview cvData={cvData} template={template} />
      </div>

      {/* marcajele de sfârșit de pagină — unde va rupe PDF-ul */}
      {pages > 1 &&
        Array.from({ length: pages - 1 }, (_, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              top: (i + 1) * PAGE_H * scale,
              left: 0,
              right: 0,
              borderTop: "2px dashed var(--hairline-strong)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                right: 8,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--faint)",
                backgroundColor: "#fff",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              Pagina {i + 2}
            </span>
          </div>
        ))}
    </div>
  );
}
