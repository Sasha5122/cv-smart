"use client";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/context";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, type Locale } from "@/lib/i18n/locale";

/** Scrie cookie-ul de limbă din browser (nu e httpOnly) și reîmprospătează datele. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

/** Comutator RO | EN. `on="dark"` pentru fundaluri închise (footer, sidebar). */
export function LanguageSwitch({ on = "light", compact = false }: { on?: "light" | "dark"; compact?: boolean }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const dark = on === "dark";

  const change = (next: Locale) => {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  };

  return (
    <div
      data-testid="lang-switch"
      role="group"
      aria-label={t.common.languageSwitch}
      style={{
        display: "inline-flex",
        border: `1px solid ${dark ? "var(--sidebar-line)" : "var(--hairline-strong)"}`,
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            data-testid={`lang-${l}`}
            onClick={() => change(l)}
            aria-pressed={active}
            style={{
              fontSize: compact ? 11.5 : 12.5,
              fontWeight: 700,
              padding: compact ? "5px 9px" : "6px 11px",
              border: "none",
              cursor: active ? "default" : "pointer",
              backgroundColor: active ? (dark ? "var(--sidebar-fg)" : "var(--ink)") : "transparent",
              color: active ? (dark ? "var(--sidebar-bg)" : "#fff") : dark ? "var(--sidebar-muted)" : "var(--muted-foreground)",
              lineHeight: 1.2,
            }}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
