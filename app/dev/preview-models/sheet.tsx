"use client";
import type { CVData, TemplateId } from "@/lib/types/cv";
import { CVPreview } from "@/components/wizard/cv-preview";

/* Wrapper client: randează CVPreview exact la lățimea de referință (760px),
   ca screenshot-ul să aibă aceleași proporții cu foaia din pagina finală. */
export function PreviewSheet({ cvData, template }: { cvData: CVData; template: TemplateId }) {
  return (
    <div data-preview-sheet={template} style={{ width: 760, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
      <CVPreview cvData={cvData} template={template} />
    </div>
  );
}
