"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { AdminDataset } from "@/lib/admin/types";

/* ────────────────────────────────────────────────────────────────
   Panoul de administrare — protejat cu parolă (cookie httpOnly 24h).
   Datele vin ANONIMIZATE de la /api/admin/data (doar „Utilizator #…”,
   fără nume sau email). Panoul propriu-zis e componenta comună
   AdminDashboard, folosită și de /demo/admin cu date generate.
   ──────────────────────────────────────────────────────────────── */

const CARD: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid var(--hairline)",
  borderRadius: 14,
  padding: "22px 24px",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminDataset | null>(null);
  const [dataError, setDataError] = useState("");

  const loadData = async () => {
    setDataError("");
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (res.ok) {
      setData((await res.json()) as AdminDataset);
      setAuthed(true);
      return;
    }
    setAuthed(true);
    setDataError("Datele nu au putut fi încărcate. Încearcă „Reîncarcă”.");
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
        <form onSubmit={login} data-testid="admin-login" style={{ ...CARD, width: "100%", maxWidth: 380 }}>
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

  if (!data) {
    return (
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>
        {dataError ? (
          <p style={{ color: "#dc2626" }}>
            {dataError}{" "}
            <button onClick={() => loadData().catch(() => {})} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
              Reîncarcă
            </button>
          </p>
        ) : (
          <p>Se încarcă…</p>
        )}
      </main>
    );
  }

  return <AdminDashboard data={data} mode="real" onReload={() => loadData().catch(() => {})} />;
}
