"use client";
import type { CVData, TemplateId } from "@/lib/types/cv";
import { MeridianPreview, PetrolPreview, AtlanticPreview, ManhattanPreview } from "./group-headers";
import { CobaltPreview, AmberPreview, VelvetPreview, SapphirePreview, GraphitePreview } from "./group-sidebars";
import { RivieraPreview, BlushPreview, FlamingoPreview, SagePreview, SterlingPreview } from "./group-decorative";

/* Registrul preview-urilor HTML dedicate pentru cele 14 modele noi. Când
   template-ul ales e unul dintre ele, CVPreview delegă aici — designul din
   pagină oglindește PDF-ul (culori, poziția pozei, forme, coloane). */
export const MODEL_PREVIEWS: Partial<Record<TemplateId, React.ComponentType<{ data: CVData }>>> = {
  meridian: MeridianPreview,
  petrol: PetrolPreview,
  atlantic: AtlanticPreview,
  manhattan: ManhattanPreview,
  cobalt: CobaltPreview,
  amber: AmberPreview,
  velvet: VelvetPreview,
  sapphire: SapphirePreview,
  graphite: GraphitePreview,
  riviera: RivieraPreview,
  blush: BlushPreview,
  flamingo: FlamingoPreview,
  sage: SagePreview,
  sterling: SterlingPreview,
};
