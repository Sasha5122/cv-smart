"use client";
import { useState } from "react";

const FIELD: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--hairline-strong)",
  backgroundColor: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
  color: "var(--foreground)",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 13.5,
  fontWeight: 600,
  marginBottom: 6,
  color: "var(--foreground)",
};

/** Formularul de contact: nume, e-mail, mesaj → POST /api/contact. */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "Mesajul nu a putut fi trimis. Încearcă din nou.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Mesajul nu a putut fi trimis. Verifică conexiunea și încearcă din nou.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        data-testid="contact-success"
        style={{
          padding: "22px 24px",
          borderRadius: 12,
          border: "1px solid var(--green)",
          backgroundColor: "rgba(22, 163, 74, 0.06)",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        <strong>Mesajul a fost trimis. Mulțumim!</strong>
        <br />
        Îți vom răspunde la adresa {email} în cel mult 14 zile (de regulă mult mai
        repede).
      </div>
    );
  }

  return (
    <form onSubmit={submit} data-testid="contact-form">
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL} htmlFor="contact-name">
          Numele tău
        </label>
        <input
          id="contact-name"
          data-testid="contact-name"
          style={FIELD}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          placeholder="ex: Andreea Popescu"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={LABEL} htmlFor="contact-email">
          Adresa ta de e-mail
        </label>
        <input
          id="contact-email"
          data-testid="contact-email"
          style={FIELD}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={320}
          placeholder="ex: andreea@email.com"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={LABEL} htmlFor="contact-message">
          Mesajul tău
        </label>
        <textarea
          id="contact-message"
          data-testid="contact-message"
          style={{ ...FIELD, minHeight: 140, resize: "vertical" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={5000}
          placeholder="Scrie aici întrebarea sau problema ta…"
        />
      </div>

      {status === "error" && (
        <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 14 }} data-testid="contact-error">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        data-testid="contact-submit"
        className="cta-btn"
        disabled={status === "sending"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: 16,
          minHeight: 52,
          padding: "14px 36px",
          borderRadius: "var(--radius-pill)",
          border: "none",
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
          boxShadow: "0 2px 4px rgba(244,90,39,0.3), 0 10px 24px -8px rgba(244,90,39,0.5)",
        }}
      >
        {status === "sending" ? "Se trimite…" : "Trimite mesajul"}
      </button>
    </form>
  );
}
