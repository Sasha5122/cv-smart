import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ClassicTemplate } from "./classic";
import type { CVData, TemplateId } from "@/lib/types/cv";

export async function renderCVPDF(data: CVData, templateId: TemplateId): Promise<Buffer> {
  let component: React.ReactElement<DocumentProps>;

  switch (templateId) {
    case "classic":
    default:
      component = React.createElement(ClassicTemplate, { data }) as React.ReactElement<DocumentProps>;
      break;
  }

  const buffer = await renderToBuffer(component);
  return Buffer.from(buffer);
}
