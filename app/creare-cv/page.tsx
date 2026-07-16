import { WizardClient } from "@/components/wizard/wizard-client";
import { createSession } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creează-ți CV-ul",
  description:
    "Completează pașii ghidați și primești un CV profesionist în format PDF, scris cu AI, optimizat pentru piața din România.",
};

export default async function CreareCVPage() {
  const session = await createSession();

  return <WizardClient sessionId={session.id} />;
}
