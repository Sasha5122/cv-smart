import { notFound } from "next/navigation";
import { DEMO_CV } from "@/scripts/demo-cv-data";
import { ALL_TEMPLATE_IDS } from "@/lib/types/cv";
import { PreviewSheet } from "./sheet";

/* Pagină DEV (doar în development) pentru compararea vizuală preview ↔ PDF:
   randează preview-ul HTML al fiecărui model la 760px, cu datele demo — exact
   sursa pe care o folosesc screenshot-urile Playwright. Nu e link-uită nicăieri
   și e blocată în producție. */

export const dynamic = "force-static";

export default function PreviewModelsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div style={{ background: "#e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 40 }}>
      {ALL_TEMPLATE_IDS.map((id) => (
        <div key={id} data-model-block={id} style={{ width: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: "monospace", fontWeight: 700, marginBottom: 8 }}>{id}</div>
          <PreviewSheet cvData={DEMO_CV} template={id} />
        </div>
      ))}
    </div>
  );
}
