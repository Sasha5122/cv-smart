"use client";
import { useEffect, useRef, useState } from "react";
import { StepCard } from "../step-card";
import { PaginatedCVPreview } from "../paginated-preview";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2, Lock } from "lucide-react";
import type { CVData, TemplateId } from "@/lib/types/cv";
import { buildCvFilename } from "@/lib/pdf-filename";
import {
  fetchPaywallStatus,
  getPaddleClient,
  setCheckoutHandler,
  type PaywallStatus,
} from "@/lib/paddle/client";
import { PRICE_DISPLAY } from "@/lib/pricing";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────────────
   Pasul final — alegi designul CV-ului (19 variante), preview-ul se
   schimbă instant, apoi Descarcă PDF în designul ales. Schimbarea
   designului e 100% locală: zero apeluri AI, zero cost.
   ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  cvData: CVData;
  /** anunțul de la Pasul 1 — rezumatul se aliniază la el */
  jobDescription?: string;
  /** rezumatul generat se salvează în CV (preview + PDF) */
  onUpdateSummary: (summary: string) => void;
  onBack: () => void;
  /** șterge tot progresul și repornește wizard-ul de la pasul 1 */
  onRestart: () => void;
  /** anunță părintele că sesiunea e plătită → navigarea se blochează (CV înghețat) */
  onPaidLock?: () => void;
}

// detecție platformă pentru instrucțiunile post-descărcare (doar client-side)
const IS_IOS =
  typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
const IS_ANDROID = typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);

const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "classic", label: "Clasic", hint: "echilibrat, accente albastre" },
  { id: "modern", label: "Modern", hint: "sidebar închis la culoare" },
  { id: "elegant", label: "Elegant", hint: "serif, accente aurii" },
  { id: "compact", label: "Compact", hint: "dens, o singură pagină" },
  { id: "minimal", label: "Minimalist", hint: "alb-negru, aerisit" },
  { id: "meridian", label: "Meridian", hint: "antet navy, accente verzi" },
  { id: "velvet", label: "Velvet", hint: "sidebar prună, bandă mov" },
  { id: "riviera", label: "Riviera", hint: "panglică teal, poză mare" },
  { id: "flamingo", label: "Flamingo", hint: "curbe roz, panou gri" },
  { id: "atlantic", label: "Atlantic", hint: "banner albastru, poză centrată" },
  { id: "petrol", label: "Petrol", hint: "antet teal, dens, poză pătrată" },
  { id: "manhattan", label: "Manhattan", hint: "nume mare albastru, grilă" },
  { id: "blush", label: "Blush", hint: "pastel roz, forme geometrice" },
  { id: "sage", label: "Sage", hint: "panou verde salvie, serif" },
  { id: "graphite", label: "Graphite", hint: "coloană slate, bare de titlu" },
  { id: "cobalt", label: "Cobalt", hint: "albastru regal, pill-uri" },
  { id: "amber", label: "Amber", hint: "antracit cu galben, timeline" },
  { id: "sterling", label: "Sterling", hint: "gri pal, accente albastre" },
  { id: "sapphire", label: "Sapphire", hint: "cyan + navy, accente galbene" },
];

/** Mini-mockup CSS al fiecărui design pentru cardul de selecție. */
function TemplateThumb({ id }: { id: TemplateId }) {
  const line = (w: string, c = "#cbd5e1", h = 3) => (
    <div style={{ width: w, height: h, backgroundColor: c, borderRadius: 1 }} />
  );
  const base: React.CSSProperties = {
    width: 52,
    height: 68,
    backgroundColor: "#fff",
    border: "1px solid var(--hairline)",
    borderRadius: 4,
    padding: 5,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflow: "hidden",
    flexShrink: 0,
  };
  switch (id) {
    case "modern":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "34%", backgroundColor: "#0b1220" }} />
          <div style={{ flex: 1, padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("80%", "#0f172a", 4)}
            {line("40%", "#2563eb")}
            {line("90%")}
            {line("85%")}
            {line("70%")}
          </div>
        </div>
      );
    case "elegant":
      return (
        <div style={{ ...base, alignItems: "center" }}>
          {line("60%", "#1c1917", 4)}
          {line("45%", "#a16207", 2)}
          <div style={{ width: "90%", height: 1, backgroundColor: "#1c1917" }} />
          {line("80%")}
          {line("85%")}
          {line("75%")}
        </div>
      );
    case "compact":
      return (
        <div style={{ ...base, gap: 2 }}>
          {line("70%", "#0f172a", 4)}
          {line("100%", "#0f766e", 2)}
          {line("95%", "#cbd5e1", 2)}
          {line("90%", "#cbd5e1", 2)}
          {line("95%", "#cbd5e1", 2)}
          {line("85%", "#cbd5e1", 2)}
          {line("90%", "#cbd5e1", 2)}
          {line("80%", "#cbd5e1", 2)}
        </div>
      );
    case "minimal":
      return (
        <div style={{ ...base, gap: 4, padding: 7 }}>
          {line("75%", "#111111", 4)}
          <div style={{ width: "100%", height: 1, backgroundColor: "#111111" }} />
          {line("60%")}
          {line("70%")}
        </div>
      );
    case "meridian":
      return (
        <div style={{ ...base, padding: 0, gap: 0 }}>
          <div style={{ height: 20, backgroundColor: "#1e2a38", display: "flex", alignItems: "center", gap: 4, padding: "0 5px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#fff" }} />
            <div style={{ width: 18, height: 3, backgroundColor: "#7cb342", borderRadius: 1 }} />
          </div>
          <div style={{ flex: 1, padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("45%", "#6aa63c")}
            {line("90%")}
            {line("80%")}
            {line("85%")}
          </div>
        </div>
      );
    case "velvet":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "38%", backgroundColor: "#232244" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 12, backgroundColor: "#c98fa6", margin: "6px 0 4px -6px" }} />
            <div style={{ padding: "0 5px", display: "flex", flexDirection: "column", gap: 3 }}>
              {line("85%")}
              {line("75%")}
              {line("80%")}
            </div>
          </div>
        </div>
      );
    case "riviera":
      return (
        <div style={{ ...base, padding: 0, gap: 0, position: "relative", backgroundColor: "#f4fafa" }}>
          <div style={{ position: "absolute", top: 0, left: 10, width: 7, height: 26, backgroundColor: "#1fbcb4" }} />
          <div style={{ position: "absolute", top: 5, left: 4, width: 16, height: 16, borderRadius: "50%", border: "2px solid #1fbcb4", backgroundColor: "#fff" }} />
          <div style={{ position: "absolute", top: 8, right: 5, width: 20, height: 4, backgroundColor: "#17181c", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: 30, left: 5, right: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: 18, height: 6, borderRadius: 3, backgroundColor: "#1fbcb4" }} />
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    case "flamingo":
      return (
        <div style={{ ...base, padding: 0, gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 16, backgroundColor: "#f5b5bb", borderBottomLeftRadius: 14 }} />
          <div style={{ position: "absolute", top: 12, right: 0, bottom: 0, width: 16, backgroundColor: "#5b6066", borderTopLeftRadius: 12 }} />
          <div style={{ position: "absolute", top: 3, left: 5, width: 11, height: 11, borderRadius: "50%", backgroundColor: "#fff" }} />
          <div style={{ position: "absolute", top: 24, left: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: 18, height: 6, borderRadius: 3, backgroundColor: "#f5b5bb" }} />
            {line("26px")}
            {line("22px")}
          </div>
        </div>
      );
    case "atlantic":
      return (
        <div style={{ ...base, padding: 0, gap: 0, position: "relative" }}>
          <div style={{ height: 22, backgroundColor: "#1b5fb5" }} />
          <div style={{ position: "absolute", top: 14, left: "50%", marginLeft: -8, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", border: "2px solid #1b5fb5" }} />
          <div style={{ marginTop: 12, padding: "0 5px", display: "flex", flexDirection: "column", gap: 3 }}>
            {line("90%")}
            {line("80%")}
            {line("85%")}
          </div>
        </div>
      );
    case "petrol":
      return (
        <div style={{ ...base, padding: 0, gap: 0, backgroundColor: "#eef4f4" }}>
          <div style={{ height: 18, backgroundColor: "#4a7d80", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <div style={{ width: 20, height: 3, backgroundColor: "#fff", borderRadius: 1 }} />
            <div style={{ width: 10, height: 10, backgroundColor: "#dfe9e9", border: "1px solid #fff" }} />
          </div>
          <div style={{ padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "60%", height: 5, backgroundColor: "#d3e4e4" }} />
            {line("90%")}
            <div style={{ width: "70%", height: 5, backgroundColor: "#d3e4e4" }} />
            {line("80%")}
          </div>
        </div>
      );
    case "manhattan":
      return (
        <div style={{ ...base, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "55%", height: 6, backgroundColor: "#2077b4", borderRadius: 1 }} />
            <div style={{ width: 13, height: 13, backgroundColor: "#cbd5e1" }} />
          </div>
          <div style={{ width: "100%", height: 10, backgroundColor: "#2077b4", borderRadius: 3, marginTop: 2 }} />
          {line("85%")}
          {line("75%")}
          {line("80%")}
        </div>
      );
    case "blush":
      return (
        <div style={{ ...base, padding: 0, gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderLeft: "18px solid transparent", borderTop: "18px solid #f3c4bd" }} />
          <div style={{ position: "absolute", top: 4, left: 5, width: 15, height: 15, borderRadius: "50%", border: "2px solid #f3c4bd", backgroundColor: "#fff" }} />
          <div style={{ position: "absolute", top: 26, left: 5, right: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("60%", "#3f4448", 4)}
            {line("40%", "#e795a0")}
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    case "sage":
      return (
        <div style={{ ...base, padding: 0, gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 12, backgroundColor: "#e5c1b5" }} />
          <div style={{ position: "absolute", top: 2, left: 2, bottom: 2, width: 20, backgroundColor: "#7fa199", borderRadius: 5 }} />
          <div style={{ position: "absolute", top: 6, left: 6, width: 12, height: 12, borderRadius: "50%", backgroundColor: "#fff" }} />
          <div style={{ position: "absolute", top: 26, left: 27, right: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("80%", "#31413d", 4)}
            {line("90%")}
            {line("70%")}
          </div>
        </div>
      );
    case "graphite":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "40%", padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "100%", height: 16, backgroundColor: "#cbd5e1" }} />
            {line("80%", "#2b3138")}
            {line("90%")}
          </div>
          <div style={{ flex: 1, backgroundColor: "#5d7386", padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "100%", height: 6, backgroundColor: "#3e5468" }} />
            {line("85%", "#dfe6ec", 2)}
            <div style={{ width: "100%", height: 6, backgroundColor: "#3e5468" }} />
            {line("75%", "#dfe6ec", 2)}
          </div>
        </div>
      );
    case "cobalt":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "40%", backgroundColor: "#25429e", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: "#fff" }} />
            <div style={{ width: "90%", height: 3, backgroundColor: "#c8d2f0", borderRadius: 2 }} />
            <div style={{ width: "90%", height: 3, backgroundColor: "#c8d2f0", borderRadius: 2 }} />
          </div>
          <div style={{ flex: 1, padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "70%", height: 7, borderRadius: 4, backgroundColor: "#25429e" }} />
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    case "amber":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "40%", backgroundColor: "#2c3038", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#cbd5e1", border: "2px solid #ffc31e" }} />
            <div style={{ width: "85%", height: 3, backgroundColor: "#ffc31e", borderRadius: 2 }} />
            {line("80%", "#8b9097", 2)}
          </div>
          <div style={{ flex: 1, padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("70%", "#2c3038", 4)}
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    case "sterling":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "36%", backgroundColor: "#f0f1f3", padding: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "100%", height: 15, backgroundColor: "#cbd5e1" }} />
            {line("80%", "#3f6ad8", 2)}
            {line("90%", "#cbd5e1", 2)}
          </div>
          <div style={{ flex: 1, padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("60%", "#23272f", 4)}
            {line("55%", "#3f6ad8", 4)}
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    case "sapphire":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "38%", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 20, backgroundColor: "#29b7d3" }} />
            <div style={{ flex: 1, backgroundColor: "#0e1c4e", display: "flex", flexDirection: "column", gap: 3, padding: 3 }}>
              <div style={{ width: "80%", height: 3, backgroundColor: "#f4c522", borderRadius: 2 }} />
              <div style={{ width: "90%", height: 2, backgroundColor: "#3a4570", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("70%", "#0e1c4e", 4)}
            {line("90%")}
            {line("80%")}
          </div>
        </div>
      );
    default: // classic
      return (
        <div style={base}>
          {line("70%", "#0f172a", 4)}
          <div style={{ width: "100%", height: 2, backgroundColor: "#0f172a" }} />
          {line("35%", "#2563eb")}
          {line("90%")}
          {line("85%")}
          {line("60%")}
        </div>
      );
  }
}

export function Step14Draft({ sessionId, cvData, jobDescription, onUpdateSummary, onBack, onRestart, onPaidLock }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [isSummarizing, setIsSummarizing] = useState(false);
  // plata: tranzacția confirmată de checkout; supraviețuiește unui refresh
  const paidStorageKey = `cvx_txn_${sessionId}`;
  const [transactionId, setTransactionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(paidStorageKey);
  });
  const [isPaying, setIsPaying] = useState(false);
  // cod promo (testeri/prieteni) — deblochează exact ca o plată reală
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  // starea paywall vine de la SERVER (o singură sursă de adevăr): enabled,
  // config checkout și — crucial — dacă sesiunea e deja plătită (webhook),
  // ca un refresh/alt device să nu mai ceară o a doua plată
  const [paywall, setPaywall] = useState<PaywallStatus | null>(null);
  const paywallLoading = paywall === null;
  const isPaid = paywall ? !paywall.enabled || paywall.paid || Boolean(transactionId) : false;
  // CV plătit = ÎNGHEȚAT: fără Înapoi, fără schimbat designul — un CV, o plată
  const isFrozen = Boolean(paywall?.enabled) && isPaid;
  useEffect(() => {
    if (isFrozen) onPaidLock?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFrozen]);
  // fără acceptarea termenilor, descărcarea e blocată (cerință legală)
  const [termsAccepted, setTermsAccepted] = useState(false);
  // pe telefon: după descărcare oferim și „Trimite" (share sheet nativ —
  // WhatsApp, Email, Copiază etc.). Pe desktop rămâne doar descărcarea.
  const [shareFile, setShareFile] = useState<File | null>(null);
  const summaryRequested = useRef(false);

  // Rezumatul profesional se generează automat, o singură dată, din datele
  // completate (apel ieftin) — CV-ul nu mai pleacă fără profil.
  useEffect(() => {
    if (summaryRequested.current) return;
    if (cvData.summary?.trim() || cvData.experience.length === 0) return;
    summaryRequested.current = true;
    setIsSummarizing(true);
    fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData, jobDescription: jobDescription?.trim() || undefined }),
    })
      .then((res) => (res.ok ? res.json() : { summary: "" }))
      .then((data) => {
        if (typeof data.summary === "string" && data.summary.trim()) {
          onUpdateSummary(data.summary.trim());
        }
      })
      .catch(() => {})
      .finally(() => setIsSummarizing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // starea paywall de la server + preîncărcarea Paddle.js (overlay instant)
  useEffect(() => {
    let cancelled = false;
    fetchPaywallStatus(sessionId).then((status) => {
      if (cancelled) return;
      setPaywall(status);
      if (status.enabled) getPaddleClient(status);
    });
    return () => {
      cancelled = true;
      setCheckoutHandler(null);
    };
  }, [sessionId]);

  /** Varianta FINALĂ (datele + designul) intră în DB chiar înainte de plată —
   *  după plată, serverul o îngheață: doar ea se mai poate descărca/emaila. */
  const flushFinalVersion = async () => {
    await fetch(`/api/session/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv_data: cvData, template_id: template }),
    }).catch(() => {});
  };

  const handlePay = async () => {
    if (!termsAccepted) {
      toast.error("Pentru a continua, bifează mai întâi acordul cu Termenii și condițiile.");
      return;
    }
    if (!paywall?.enabled || !paywall.priceId) return;
    setIsPaying(true);
    await flushFinalVersion();
    const paddle = await getPaddleClient(paywall);
    if (!paddle) {
      setIsPaying(false);
      toast.error("Plata nu poate fi inițiată acum. Reîncarcă pagina și încearcă din nou.");
      return;
    }
    setCheckoutHandler((event) => {
      if (event.name === "checkout.completed") {
        const txn = event.data?.transaction_id;
        if (txn) {
          window.sessionStorage.setItem(paidStorageKey, txn);
          setTransactionId(txn);
          // lăsăm userul să vadă confirmarea Paddle, apoi pornim descărcarea
          setTimeout(() => {
            paddle.Checkout.close();
            toast.success("Plată confirmată. Îți pregătim PDF-ul…");
            handleDownload(txn);
          }, 1800);
        }
      }
      if (event.name === "checkout.closed") setIsPaying(false);
      if (event.name === "checkout.error") {
        setIsPaying(false);
        toast.error("Checkout-ul nu s-a putut deschide. Încearcă din nou.");
      }
    });
    const email = cvData.personal?.email?.trim();
    paddle.Checkout.open({
      items: [{ priceId: paywall.priceId, quantity: 1 }],
      // leagă tranzacția de sesiune — serverul refuză PDF-ul fără potrivire
      customData: { sessionId },
      ...(email ? { customer: { email } } : {}),
      settings: { variant: "one-page", locale: "ro", showAddDiscounts: false },
    });
  };

  /** Codul promo: salvăm datele curente, revendicăm codul, apoi descărcăm —
   *  fluxul devine identic cu cel de după o plată reală (inclusiv emailul). */
  const handleRedeem = async () => {
    if (!termsAccepted) {
      toast.error("Pentru a continua, bifează mai întâi acordul cu Termenii și condițiile.");
      return;
    }
    const code = promoCode.trim();
    if (code.length < 3) return;
    setPromoBusy(true);
    try {
      // varianta finală (date + design) intră în DB ÎNAINTE de deblocare —
      // emailul și PDF-ul reflectă exact ce vede userul, apoi se îngheață
      await flushFinalVersion();

      const res = await fetch("/api/paywall/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Cod invalid sau expirat.");
        return;
      }
      setPaywall((p) => (p ? { ...p, paid: true } : p));
      toast.success(
        data.emailSent
          ? "Cod acceptat! Ți-am trimis CV-ul și pe email. Îl descărcăm acum…"
          : "Cod acceptat! Îți descărcăm CV-ul…"
      );
      await handleDownload();
    } finally {
      setPromoBusy(false);
    }
  };

  /** Aduce PDF-ul generat ca blob, sau null la refuz de plată / eroare. */
  const fetchPdfBlob = async (txnOverride?: string): Promise<Blob | null> => {
    // datele merg direct din browser — PDF-ul se generează și dacă
    // persistența sesiunii e indisponibilă
    const res = await fetch(`/api/pdf/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cvData,
        templateId: template,
        transactionId: txnOverride ?? transactionId ?? undefined,
      }),
    });
    if (res.status === 402) {
      toast.error("Plata nu a fost confirmată încă. Dacă ai plătit, așteaptă câteva secunde și încearcă din nou.");
      return null;
    }
    if (!res.ok) throw new Error();
    return await res.blob();
  };

  const handleDownload = async (txnOverride?: string) => {
    if (!termsAccepted) {
      toast.error("Pentru a descărca CV-ul, bifează mai întâi acordul cu Termenii și condițiile.");
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await fetchPdfBlob(txnOverride);
      if (!blob) return;
      const filename = buildCvFilename(cvData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // numele utilizatorului + data generării (ex: CV_Elena_Stanciu_2026-07-10.pdf)
      a.download = filename;
      a.click();
      // aplicația RĂMÂNE pagina finală — nu deschidem și nu înlocuim nimic
      // cu PDF-ul; revocăm după ce browserul a preluat descărcarea
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      if (IS_IOS) {
        toast.success("PDF descărcat — îl găsești în Descărcări (săgeata din Safari) sau în Fișiere.");
      } else if (IS_ANDROID) {
        toast.success("PDF salvat în folderul Descărcări. Succes la aplicare! 🎉");
      } else {
        toast.success("CV-ul a fost descărcat. Succes la aplicare! 🎉");
      }

      // doar pe dispozitive touch cu share nativ de fișiere (telefoane/tablete)
      try {
        const file = new File([blob], filename, { type: "application/pdf" });
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch && navigator.canShare?.({ files: [file] })) {
          setShareFile(file);
        }
      } catch {
        // share indisponibil — descărcarea a mers oricum
      }
    } catch {
      toast.error("Eroare la generarea PDF-ului. Încearcă din nou.");
    } finally {
      setIsDownloading(false);
    }
  };

  /** „Trimite pe WhatsApp" — share sheet nativ cu PDF-ul (doar mobil). */
  const handleWhatsAppShare = async () => {
    try {
      let file = shareFile;
      if (!file) {
        setIsDownloading(true);
        const blob = await fetchPdfBlob();
        setIsDownloading(false);
        if (!blob) return;
        file = new File([blob], buildCvFilename(cvData), { type: "application/pdf" });
        setShareFile(file);
      }
      await navigator.share({ files: [file], title: "CV-ul meu", text: "CV-ul meu, creat cu CVexpres" });
    } catch {
      // userul a închis share sheet-ul sau share indisponibil — nu e eroare
      setIsDownloading(false);
    }
  };

  return (
    <StepCard
      kicker="Finalizare"
      title="CV-ul tău e gata."
      subtitle="Alege designul care ți se potrivește — exact așa va arăta PDF-ul descărcat."
    >
      {/* Selectorul de design — ascuns după plată: designul plătit e final */}
      {!isFrozen && (
      <div
        role="radiogroup"
        aria-label="Alege designul CV-ului"
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}
      >
        {TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === template;
          return (
            <button
              key={tpl.id}
              role="radio"
              aria-checked={isSelected}
              data-testid={`template-${tpl.id}`}
              onClick={() => setTemplate(tpl.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px 10px 10px",
                borderRadius: 10,
                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--hairline)",
                backgroundColor: isSelected ? "var(--wash)" : "var(--card)",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <TemplateThumb id={tpl.id} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: isSelected ? "var(--primary-strong)" : "var(--ink)" }}>
                  {tpl.label}
                  {isSelected && <Check size={14} style={{ color: "var(--primary)" }} />}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>{tpl.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      )}

      {isSummarizing && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted-foreground)",
            marginBottom: 12,
          }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--primary)" }} />
          Scriem rezumatul tău profesional…
        </div>
      )}

      {/* foile A4 — paginate ca PDF-ul, fără scrollbar intern */}
      <div
        style={{
          backgroundColor: "var(--paper-deep)",
          border: "1px solid var(--hairline)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <PaginatedCVPreview cvData={cvData} template={template} sheetTestId="final-cv-sheet" />
        </div>
      </div>

      {/* ── după plată: confirmare + livrare pe toate canalele ── */}
      {paywall?.enabled && isPaid && (
        <div
          data-testid="payment-success"
          style={{
            marginTop: 26,
            padding: "22px 20px",
            borderRadius: 14,
            border: "1.5px solid var(--green, #16a34a)",
            backgroundColor: "rgba(22, 163, 74, 0.06)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 19, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
            CV-ul tău e gata! ✔
          </p>
          {cvData.personal?.email && (
            <p style={{ fontSize: 14, color: "#15803D", marginBottom: 4 }}>
              Ți l-am trimis și pe email la <strong>{cvData.personal.email}</strong> —
              cu PDF-ul atașat.
            </p>
          )}
          <p style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
            Poți re-descărca CV-ul oricând în următoarele 30 de zile din emailul primit.
          </p>
          <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 4 }}>
            CV-ul plătit e <strong>final</strong> — pentru modificări sau un CV nou,
            apasă „Începe de la zero” mai jos (proces nou, plată nouă).
          </p>

          {/* butonul principal: descarcă (din nou) PDF-ul — pagina aplicației
              rămâne pe loc, fișierul merge în Descărcări/Fișiere */}
          <button
            type="button"
            data-testid="download-again"
            onClick={() => handleDownload()}
            disabled={isDownloading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", marginTop: 14, minHeight: 50,
              borderRadius: "var(--radius-pill)",
              border: "none", backgroundColor: "var(--primary)", color: "#fff",
              fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: 15.5,
              cursor: "pointer",
            }}
          >
            ⬇ Descarcă PDF-ul
          </button>

          {/* share nativ — gate pe capabilitate (canShare), nu pe userAgent:
              acoperă și iPad-urile care se prezintă ca desktop */}
          {typeof navigator !== "undefined" && !!navigator.canShare && (
            <button
              type="button"
              data-testid="whatsapp-share"
              onClick={handleWhatsAppShare}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", marginTop: 12, minHeight: 50,
                borderRadius: "var(--radius-pill)",
                border: "none", backgroundColor: "#25D366", color: "#fff",
                fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: 15.5,
                cursor: "pointer",
              }}
            >
              💬 Trimite pe WhatsApp
            </button>
          )}

          {/* instrucțiuni per platformă — doar pe mobil */}
          {IS_ANDROID && (
            <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 12, lineHeight: 1.55 }}>
              După descărcare, CV-ul e în folderul <strong>Descărcări</strong>. Îl găsești
              și trăgând în jos bara de notificări.
            </p>
          )}
          {IS_IOS && (
            <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 12, lineHeight: 1.55 }}>
              PDF-ul descărcat îl găsești în <strong>Descărcări</strong> (săgeata din
              bara Safari) sau în aplicația <strong>Fișiere</strong> — ori trimite-l
              direct pe WhatsApp de mai sus.
            </p>
          )}
        </div>
      )}

      {/* consimțământ obligatoriu — fără bifă, descărcarea nu pornește */}
      <label
        data-testid="terms-consent"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginTop: 26,
          padding: "14px 16px",
          borderRadius: 12,
          border: termsAccepted ? "1px solid var(--green)" : "1px solid var(--hairline-strong)",
          backgroundColor: termsAccepted ? "rgba(22, 163, 74, 0.06)" : "var(--wash)",
          cursor: "pointer",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          data-testid="terms-checkbox"
          style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--primary)", cursor: "pointer", flexShrink: 0 }}
        />
        <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--foreground)" }}>
          Am luat la cunoștință și sunt de acord cu{" "}
          <a
            href="/termeni"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Termenii și condițiile
          </a>{" "}
          și cu{" "}
          <a
            href="/confidentialitate"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Politica de confidențialitate
          </a>
          . Solicit executarea imediată a serviciului și înțeleg că îmi pierd dreptul de
          retragere odată cu descărcarea CV-ului.
        </span>
      </label>

      <div className="flex gap-3" style={{ marginTop: 18 }}>
        {/* după plată CV-ul e înghețat — Înapoi dispare, rămâne doar restart */}
        {!isFrozen && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Înapoi
          </Button>
        )}
        {paywallLoading ? (
          <Button size="lg" className="flex-[2]" loading disabled>
            Se pregătește…
          </Button>
        ) : isPaid ? (
          <Button
            onClick={() => handleDownload()}
            size="lg"
            className="flex-[2]"
            loading={isDownloading}
            disabled={!termsAccepted}
            icon={<Download className="w-4 h-4" />}
          >
            Descarcă PDF
          </Button>
        ) : (
          <Button
            onClick={handlePay}
            size="lg"
            className="flex-[2]"
            loading={isPaying || isDownloading}
            disabled={!termsAccepted}
            data-testid="pay-download"
            icon={<Lock className="w-4 h-4" />}
          >
            Plătește și descarcă — {PRICE_DISPLAY}
          </Button>
        )}
      </div>

      {!isPaid && !paywallLoading && paywall?.enabled && (
        <>
          <p
            style={{
              marginTop: 10,
              fontSize: 12.5,
              color: "var(--muted-foreground)",
              textAlign: "center",
            }}
          >
            {PRICE_DISPLAY} · plată unică, TVA inclus · plata se procesează securizat în EUR prin Paddle
          </p>

          {/* ── cod de reducere / promo (testeri) ── */}
          {!promoOpen ? (
            <button
              type="button"
              data-testid="promo-toggle"
              onClick={() => setPromoOpen(true)}
              style={{
                display: "block", margin: "10px auto 0",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "var(--primary)",
                textDecoration: "underline",
              }}
            >
              Ai un cod de reducere?
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, maxWidth: 380, margin: "12px auto 0" }}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                placeholder="Codul tău"
                data-testid="promo-input"
                autoFocus
                style={{
                  flex: 1, padding: "11px 14px", fontSize: 15,
                  borderRadius: 8, border: "1px solid var(--input-border)",
                  backgroundColor: "var(--card)", color: "var(--ink)",
                  textTransform: "uppercase", letterSpacing: 1,
                }}
              />
              <Button
                onClick={handleRedeem}
                loading={promoBusy}
                disabled={promoCode.trim().length < 3}
                data-testid="promo-apply"
              >
                Aplică
              </Button>
            </div>
          )}
        </>
      )}

      {/* pe telefon, după descărcare: trimite CV-ul oriunde (share sheet nativ).
          Ascuns când caseta de succes post-plată e vizibilă — aceea are deja
          propriul buton de share (evităm două butoane identice). */}
      {shareFile && !(paywall?.enabled && isPaid) && (
        <button
          type="button"
          data-testid="share-cv"
          onClick={() => {
            navigator
              .share({
                files: [shareFile],
                title: "CV-ul meu",
                text: "CV-ul meu, creat cu CVexpres",
              })
              .catch(() => {
                // userul a închis share sheet-ul — nimic de făcut
              });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            marginTop: 14,
            minHeight: 54,
            borderRadius: "var(--radius-pill)",
            border: "1.5px solid var(--primary)",
            backgroundColor: "var(--wash)",
            color: "var(--primary-strong)",
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: 15.5,
            cursor: "pointer",
          }}
        >
          📤 Trimite CV-ul — WhatsApp, Email, Salvează…
        </button>
      )}

      {/* repornire completă — util când vrei alt CV sau ai greșit ceva major */}
      <button
        type="button"
        data-testid="restart-wizard"
        onClick={() => {
          if (
            window.confirm(
              "Sigur vrei să începi de la zero? Toate datele introduse se vor șterge definitiv."
            )
          ) {
            onRestart();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginTop: 22,
          minHeight: 54,
          borderRadius: "var(--radius-pill)",
          border: "1.5px dashed var(--hairline-strong)",
          backgroundColor: "transparent",
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: 15.5,
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#dc2626";
          e.currentTarget.style.color = "#dc2626";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--hairline-strong)";
          e.currentTarget.style.color = "var(--muted-foreground)";
        }}
      >
        ↺ Începe de la zero
      </button>
    </StepCard>
  );
}
