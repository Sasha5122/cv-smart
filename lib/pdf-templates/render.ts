import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ClassicTemplate } from "./classic";
import { ModernTemplate } from "./modern";
import { ElegantTemplate } from "./elegant";
import { CompactTemplate } from "./compact";
import { MinimalTemplate } from "./minimal";
import { MeridianTemplate } from "./models/meridian";
import { AtlanticTemplate } from "./models/atlantic";
import { ManhattanTemplate } from "./models/manhattan";
import { CobaltTemplate } from "./models/cobalt";
import { AmberTemplate } from "./models/amber";
import { SapphireTemplate } from "./models/sapphire";
import { VelvetTemplate } from "./models/velvet";
import { BlushTemplate } from "./models/blush";
import { SageTemplate } from "./models/sage";
import { GraphiteTemplate } from "./models/graphite";
import { RivieraTemplate } from "./models/riviera";
import { SterlingTemplate } from "./models/sterling";
import { FlamingoTemplate } from "./models/flamingo";
import { PetrolTemplate } from "./models/petrol";
import type { CVData, TemplateId } from "@/lib/types/cv";

const TEMPLATES: Record<TemplateId, React.ComponentType<{ data: CVData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  elegant: ElegantTemplate,
  compact: CompactTemplate,
  minimal: MinimalTemplate,
  meridian: MeridianTemplate,
  atlantic: AtlanticTemplate,
  manhattan: ManhattanTemplate,
  cobalt: CobaltTemplate,
  amber: AmberTemplate,
  sapphire: SapphireTemplate,
  velvet: VelvetTemplate,
  blush: BlushTemplate,
  sage: SageTemplate,
  graphite: GraphiteTemplate,
  riviera: RivieraTemplate,
  sterling: SterlingTemplate,
  flamingo: FlamingoTemplate,
  petrol: PetrolTemplate,
};

export async function renderCVPDF(data: CVData, templateId: TemplateId): Promise<Buffer> {
  const Template = TEMPLATES[templateId] ?? ClassicTemplate;
  const component = React.createElement(Template, { data }) as React.ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(component);
  return Buffer.from(buffer);
}
