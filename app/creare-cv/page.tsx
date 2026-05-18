import { WizardClient } from "@/components/wizard/wizard-client";
import { createSession } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function CreareCVPage() {
  const session = await createSession();

  return <WizardClient sessionId={session.id} />;
}
