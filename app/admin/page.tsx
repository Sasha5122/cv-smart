"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

/* ────────────────────────────────────────────────────────────────
   Panoul de administrare — protejat cu parolă (cookie httpOnly 24h).
   Secțiuni: CV-uri generate, sesiuni în lucru (ultimul pas atins,
   plătit sau nu), mesajele din pagina de contact. Datele expirate
   se șterg automat la fiecare accesare, conform Termenilor.
   ──────────────────────────────────────────────────────────────── */

interface SessionRow {
  id: string;
  name: string;
  email: string;
  status: string;
  generated: boolean;
  template: string | null;
  lastStep: number | null;
  paid: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface MessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface AdminData {
  deletedCount: number;
  retentionDays: number;
  cvs: SessionRow[];
  sessions: SessionRow[];
  messages: MessageRow[];
}

const CARD: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid var(--hairline)",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 26,
};

const TH: React.CSSProperties = {
  textAlign: "left",
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted-foreground)",
  padding: "8px 10px",
  borderBottom: "1px solid var(--hairline)",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  fontSize: 13.5,
  padding: "10px 10px",
  borderBottom: "1px solid var(--hairline)",
  verticalAlign: "top",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

const STEP_LABELS: Record<number, string> = {
  1: "Contact",
  2: "Poză",
  3: "Unde aplici",
  4: "Experiență",
  5: "Educație",
  6: "Abilități",
  7: "Limbi",
  8: "Permis",
  9: "Hobby-uri",
  10: "Finalizare",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);

  const loadData = async () => {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (res.ok) {
      setData(await res.json());
      setAuthed(true);
    }
  };

  // dacă avem deja cookie valid, intrăm direct
  useEffect(() => {
    loadData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setLoginError(body?.error || "Parolă incorectă.");
        return;
      }
      await loadData();
    } catch {
      setLoginError("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  /* ── ecranul de login ──────────────────────────────────────── */
  if (!authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <form
          onSubmit={login}
          data-testid="admin-login"
          style={{ ...CARD, width: "100%", maxWidth: 380, marginBottom: 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <LogoMark size={28} on="light" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>CVexpres — Admin</span>
          </div>
          <label htmlFor="admin-pass" style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>
            Parola de administrare
          </label>
          <input
            id="admin-pass"
            data-testid="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "11px 13px",
              borderRadius: 10,
              border: "1px solid var(--hairline-strong)",
              fontSize: 15,
              marginBottom: 12,
            }}
          />
          {loginError && (
            <p data-testid="admin-login-error" style={{ color: "#dc2626", fontSize: 13.5, marginBottom: 12 }}>
              {loginError}
            </p>
          )}
          <button
            type="submit"
            data-testid="admin-login-submit"
            disabled={loading}
            className="cta-btn"
            style={{
              width: "100%",
              minHeight: 46,
              borderRadius: "var(--radius-pill)",
              border: "none",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {loading ? "Se verifică…" : "Intră"}
          </button>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              ← Înapoi la pagina principală
            </Link>
          </p>
        </form>
      </main>
    );
  }

  /* ── panoul propriu-zis ────────────────────────────────────── */
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--foreground)" }}>
          <LogoMark size={28} on="light" />
          <span style={{ fontWeight: 700, fontSize: 17 }}>CVexpres — Admin</span>
        </Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {data && (
            <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
              Retenție: {data.retentionDays} zile · Șterse automat acum: {data.deletedCount}
            </span>
          )}
          <button
            onClick={() => loadData()}
            style={{
              fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: "var(--radius-pill)",
              border: "1px solid var(--hairline-strong)", backgroundColor: "#fff", cursor: "pointer",
            }}
          >
            Reîncarcă
          </button>
          <Link
            href="/"
            style={{
              fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: "var(--radius-pill)",
              border: "1px solid var(--hairline-strong)", backgroundColor: "#fff",
              color: "var(--foreground)", textDecoration: "none",
            }}
          >
            ← Pagina principală
          </Link>
        </div>
      </header>

      {!data ? (
        <p>Se încarcă…</p>
      ) : (
        <>
          {/* CV-uri generate */}
          <section style={CARD} data-testid="admin-cvs">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              CV-uri generate ({data.cvs.length})
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 14 }}>
              Se șterg automat la {data.retentionDays} de zile de la ultima activitate,
              conform Termenilor și condițiilor.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Nume</th>
                    <th style={TH}>Email</th>
                    <th style={TH}>Design</th>
                    <th style={TH}>Plătit</th>
                    <th style={TH}>Generat la</th>
                    <th style={TH}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cvs.length === 0 && (
                    <tr><td style={TD} colSpan={6}>Niciun CV generat încă.</td></tr>
                  )}
                  {data.cvs.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...TD, fontWeight: 600 }}>{s.name}</td>
                      <td style={TD}>{s.email}</td>
                      <td style={TD}>{s.template ?? "classic"}</td>
                      <td style={TD}>{s.paid === null ? "— (plăți inactive)" : s.paid ? "Da" : "Nu"}</td>
                      <td style={TD}>{fmtDate(s.updatedAt)}</td>
                      <td style={TD}>
                        <a
                          href={`/api/pdf/${s.id}`}
                          style={{ color: "var(--primary)", fontWeight: 600 }}
                        >
                          Descarcă
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sesiuni în lucru */}
          <section style={CARD} data-testid="admin-sessions">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Sesiuni fără CV generat ({data.sessions.length})
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 14 }}>
              Unde s-a oprit fiecare utilizator care nu a ajuns la descărcare.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Nume</th>
                    <th style={TH}>Email</th>
                    <th style={TH}>Ultimul pas atins</th>
                    <th style={TH}>Plătit</th>
                    <th style={TH}>Ultima activitate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.length === 0 && (
                    <tr><td style={TD} colSpan={5}>Nicio sesiune în lucru.</td></tr>
                  )}
                  {data.sessions.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...TD, fontWeight: 600 }}>{s.name}</td>
                      <td style={TD}>{s.email}</td>
                      <td style={TD}>
                        {s.lastStep
                          ? `Pasul ${s.lastStep} — ${STEP_LABELS[s.lastStep] ?? ""}`
                          : "A deschis wizard-ul"}
                      </td>
                      <td style={TD}>{s.paid === null ? "— (plăți inactive)" : s.paid ? "Da" : "Nu"}</td>
                      <td style={TD}>{fmtDate(s.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mesaje de contact */}
          <section style={CARD} data-testid="admin-messages">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
              Mesaje din pagina de contact ({data.messages.length})
            </h2>
            {data.messages.length === 0 && (
              <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>Niciun mesaj încă.</p>
            )}
            {data.messages.map((m) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {m.name}{" "}
                    <a href={`mailto:${m.email}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {m.email}
                    </a>
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{fmtDate(m.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.message}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
