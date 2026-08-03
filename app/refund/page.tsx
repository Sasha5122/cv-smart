import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { LEGAL } from "@/lib/legal-config";

export const metadata = {
  title: "Politica de rambursare — CVexpres",
  description:
    "Cum funcționează rambursările la CVexpres: garanția livrării, dreptul de retragere pentru conținut digital și pașii pentru a cere o rambursare.",
};

const S: React.CSSProperties = { fontSize: 15, lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: 14 };
const H: React.CSSProperties = { fontSize: 20, fontWeight: 700, margin: "34px 0 12px", color: "var(--foreground)" };

export default function RefundPage() {
  return (
    <>
      <LandingHeader />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 96px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Politica de rambursare
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--faint)", marginBottom: 28 }}>
          Ultima actualizare: 15 iulie 2026 · Versiunea 1.0
        </p>

        <p style={S}>
          Cum ceri o rambursare: scrie-ne la {LEGAL.contactEmail}, de pe emailul folosit
          la plată. Răspundem în cel mult 14 zile. Rambursările aprobate sunt procesate
          prin Creem pe metoda de plată originală.
        </p>

        <h2 style={H}>1. Garanția noastră</h2>
        <p style={S}>
          Dacă nu primiți CV-ul generat în format PDF valid și descărcabil, rambursăm
          integral prețul plătit. Întrucât aveți posibilitatea de a previzualiza și edita
          integral conținutul CV-ului înainte de plată, aprecierea subiectivă ulterioară
          asupra formulărilor nu constituie neconformitate în sensul prezentei politici.
        </p>

        <h2 style={H}>2. Conformitatea conținutului digital și remedii</h2>
        <p style={S}>
          În temeiul OUG nr. 141/2021 (transpunerea Directivei (UE) 2019/770), răspundem
          pentru conformitatea conținutului digital livrat. Dacă CV-ul generat prezintă o
          neconformitate (de exemplu, fișierul PDF este corupt, nu poate fi descărcat sau
          nu corespunde descrierii Serviciului), aveți dreptul, în această ordine, la:
          (a) aducerea în conformitate (regenerarea documentului), (b) reducerea
          corespunzătoare a prețului sau (c) rezoluțiunea contractului cu rambursarea
          prețului.
        </p>

        <h2 style={H}>3. Dreptul de retragere</h2>
        <p style={S}>
          Conform art. 16 lit. m) din OUG nr. 34/2014, dreptul de retragere de 14 zile nu
          se aplică contractelor de furnizare de conținut digital care nu este livrat pe
          un suport material, dacă executarea a început cu acordul prealabil expres al
          consumatorului și cu confirmarea acestuia că își pierde dreptul de retragere.
          Prin bifarea căsuței de acceptare și prin generarea CV-ului, vă exprimați
          acordul expres pentru executarea imediată a contractului și confirmați că
          înțelegeți că vă pierdeți dreptul de retragere din momentul descărcării
          documentului.
        </p>

        <h2 style={H}>4. Procesarea rambursărilor</h2>
        <p style={S}>
          Plățile sunt procesate de Creem (Armitage Labs OÜ), în calitate de Merchant of
          Record; rambursările aprobate se efectuează prin Creem, pe metoda de plată
          folosită la achiziție, de regulă în 5–10 zile lucrătoare, în funcție de bancă.
        </p>

        <p style={S}>
          Contextul complet al acestor prevederi se află în{" "}
          <Link href="/termeni" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Termeni și condiții
          </Link>
          .
        </p>

        <div style={{ marginTop: 40 }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            ← Înapoi la pagina principală
          </Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
