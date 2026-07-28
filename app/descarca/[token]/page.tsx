import Link from "next/link";
import { verifyDownloadToken } from "@/lib/download-token";
import { getSession, isSessionPaid } from "@/lib/db/queries";

export const metadata = {
  title: "Descarcă CV-ul",
  robots: { index: false, follow: false },
};

/**
 * Pagina linkului din emailul de livrare — valabil 30 de zile de la plată.
 * Token valid → butoane mari de vizualizare/descărcare.
 * Token expirat/invalid → mesaj prietenos, nu eroare seacă.
 */
export default async function DescarcaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const check = verifyDownloadToken(token);

  let valid = false;
  let firstName = "";
  if (check.ok) {
    const session = await getSession(check.sessionId).catch(() => null);
    if (session?.cv_data?.personal && (await isSessionPaid(session).catch(() => false))) {
      valid = true;
      firstName = session.cv_data.personal.firstName ?? "";
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 480,
    margin: "80px auto",
    padding: "40px 32px",
    backgroundColor: "var(--card, #fff)",
    border: "1px solid var(--hairline, #e2e8f0)",
    borderRadius: 18,
    textAlign: "center",
  };

  if (!valid) {
    return (
      <main style={{ padding: "0 20px" }}>
        <div style={card}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>⏳</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            Linkul a expirat
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted-foreground, #64748b)", marginBottom: 20 }}>
            CV-urile se păstrează 30 de zile de la plată, apoi se șterg automat
            pentru protecția datelor tale. Scrie-ne la{" "}
            <a href="mailto:support@cvexpres.ro" style={{ color: "var(--primary, #2563eb)", fontWeight: 600 }}>
              support@cvexpres.ro
            </a>{" "}
            dacă ai nevoie de ajutor.
          </p>
          <Link
            href="/creare-cv"
            style={{ display: "inline-block", padding: "13px 26px", backgroundColor: "var(--primary, #2563eb)", color: "#fff", fontWeight: 700, fontSize: 15, borderRadius: 999, textDecoration: "none" }}
          >
            Creează un CV nou
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 20px" }}>
      <div style={card}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>📄</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {firstName ? `${firstName}, CV-ul tău e aici` : "CV-ul tău e aici"}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted-foreground, #64748b)", marginBottom: 24 }}>
          Îl poți vedea direct în browser sau descărca în format PDF.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href={`/api/descarca/${token}?download=1`}
            data-testid="redownload-attachment"
            style={{ display: "block", padding: "15px 26px", backgroundColor: "var(--primary, #2563eb)", color: "#fff", fontWeight: 700, fontSize: 16, borderRadius: 999, textDecoration: "none" }}
          >
            ⬇ Descarcă PDF
          </a>
          <a
            href={`/api/descarca/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="redownload-inline"
            style={{ display: "block", padding: "14px 26px", backgroundColor: "var(--wash, #f1f5f9)", color: "var(--primary, #2563eb)", fontWeight: 700, fontSize: 15, borderRadius: 999, textDecoration: "none", border: "1.5px solid var(--primary, #2563eb)" }}
          >
            Vezi CV-ul în browser
          </a>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--faint, #94a3b8)", marginTop: 20 }}>
          Linkul funcționează 30 de zile de la plată.
        </p>
      </div>
    </main>
  );
}
