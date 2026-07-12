import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ClassicTemplate } from "./classic";
import { ModernTemplate } from "./modern";
import { ElegantTemplate } from "./elegant";
import { CompactTemplate } from "./compact";
import { MinimalTemplate } from "./minimal";
import type { CVData, TemplateId } from "@/lib/types/cv";

const TEMPLATES: Record<TemplateId, React.ComponentType<{ data: CVData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  elegant: ElegantTemplate,
  compact: CompactTemplate,
  minimal: MinimalTemplate,
};

export async function renderCVPDF(data: CVData, templateId: TemplateId): Promise<Buffer> {
  const Template = TEMPLATES[templateId] ?? ClassicTemplate;
  const component = React.createElement(Template, { data }) as React.ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(component);
  return Buffer.from(buffer);
}
