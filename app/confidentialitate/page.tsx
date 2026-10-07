import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LegalLanguageNote } from "@/components/i18n/legal-language-note";
import { LandingFooter } from "@/components/landing/footer";
import { LEGAL } from "@/lib/legal-config";

export const metadata = {
  title: "Politica de confidențialitate — CVexpres",
  description:
    "Cum prelucrează CVexpres datele tale personale: ce colectăm, de ce, cât timp le păstrăm (30 de zile) și ce drepturi ai conform GDPR.",
};

const S: React.CSSProperties = { fontSize: 15, lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: 14 };
const H: React.CSSProperties = { fontSize: 20, fontWeight: 700, margin: "34px 0 12px", color: "var(--foreground)" };
const LI: React.CSSProperties = { ...S, marginBottom: 8 };

export default function ConfidentialitatePage() {
  return (
    <>
      <LandingHeader />
      <LegalLanguageNote />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 96px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Politica de confidențialitate
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--faint)", marginBottom: 28 }}>
          Ultima actualizare: 15 iulie 2026 · Versiunea 1.0
        </p>

        <h2 style={H}>1. Operatorul de date</h2>
        <p style={S}>
          Operatorul datelor dumneavoastră cu caracter personal este CVexpres, cu adresa
          de contact {LEGAL.contactEmail}. Ne puteți contacta pentru orice
          aspect legat de datele personale prin{" "}
          <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
            pagina de Contact
          </Link>
          . Prelucrarea se face în conformitate cu Regulamentul (UE) 2016/679 („GDPR") și
          Legea nr. 190/2018.
        </p>

        <h2 style={H}>2. Ce date prelucrăm</h2>
        <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
          <li style={LI}>
            <strong>Date introduse de dumneavoastră pentru CV:</strong> nume, prenume,
            e-mail, telefon, adresă, poză (opțional), experiență profesională,
            educație, abilități, limbi străine, permis de conducere, hobby-uri, descrierea
            jobului vizat.
          </li>
          <li style={LI}>
            <strong>Date din formularul de contact:</strong> nume, e-mail și mesajul
            transmis.
          </li>
          <li style={LI}>
            <strong>Date tehnice minime</strong> necesare funcționării (identificatorul
            sesiunii, progresul în pași, momentul ultimei activități).
          </li>
        </ul>

        <h2 style={H}>3. Scopurile și temeiurile prelucrării</h2>
        <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
          <li style={LI}>
            <strong>Generarea CV-ului</strong> — executarea contractului (art. 6 alin. 1
            lit. b GDPR);
          </li>
          <li style={LI}>
            <strong>Răspunsul la mesajele de contact</strong> — interesul legitim de a
            comunica cu utilizatorii (art. 6 alin. 1 lit. f GDPR);
          </li>
          <li style={LI}>
            <strong>Îndeplinirea obligațiilor legale</strong> (fiscale, de protecție a
            consumatorului) — art. 6 alin. 1 lit. c GDPR.
          </li>
        </ul>
        <p style={S}>
          Nu folosim datele în scop de marketing, nu le vindem și nu luăm decizii
          automatizate cu efecte juridice asupra dumneavoastră.
        </p>

        <h2 style={H}>4. Cui transmitem datele (persoane împuternicite)</h2>
        <p style={S}>
          Pentru funcționarea Serviciului folosim furnizori care prelucrează date în
          numele nostru, pe bază de contract: furnizori de modele de inteligență
          artificială (pentru formularea textelor din CV), furnizorul bazei de date și al
          găzduirii. Acești furnizori pot prelucra date în afara SEE numai cu garanții
          adecvate (clauze contractuale standard aprobate de Comisia Europeană sau decizii
          de adecvare, inclusiv EU–US Data Privacy Framework). Textele și poza
          trimise modelelor AI prin API nu sunt folosite de aceștia pentru antrenarea
          modelelor, conform politicilor lor.
        </p>
        <p style={S}>
          Procesatorul de plăți Creem (Armitage Labs OÜ), în calitate de Merchant of Record,
          prelucrează datele necesare tranzacției (email, date de plată) conform propriei
          politici de confidențialitate (creem.io/privacy). Operatorul nu
          stochează și nu are acces la datele complete ale cardului.
        </p>

        <h2 style={H}>5. Cât timp păstrăm datele</h2>
        <p style={S}>
          CV-ul generat și datele sesiunii de creare (inclusiv conținutul CV-ului) se
          păstrează <strong>30 de zile de la ultima activitate</strong>, pentru a
          permite re-descărcarea documentului din linkul primit pe email, apoi sunt{" "}
          <strong>șterse automat și definitiv</strong>. Emailul de livrare cu PDF-ul
          atașat rămâne în căsuța dumneavoastră de email. Mesajele de contact se
          păstrează cel mult 12 luni. Datele necesare facturării se păstrează conform
          termenelor legale fiscale.
        </p>

        <h2 style={H}>6. Drepturile dumneavoastră</h2>
        <p style={S}>
          Conform GDPR, aveți dreptul de: acces la date, rectificare, ștergere („dreptul
          de a fi uitat"), restricționarea prelucrării, portabilitatea datelor, opoziție,
          precum și dreptul de a nu face obiectul unei decizii bazate exclusiv pe
          prelucrare automatizată. Pentru exercitarea acestor drepturi, scrieți-ne prin
          pagina de Contact; răspundem în cel mult 30 de zile.
        </p>
        <p style={S}>
          Dacă apreciați că prelucrarea încalcă legea, puteți depune o plângere la
          Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
          (ANSPDCP — <strong>dataprotection.ro</strong>).
        </p>

        <h2 style={H}>7. Securitatea datelor</h2>
        <p style={S}>
          Aplicăm măsuri tehnice și organizatorice adecvate: comunicare criptată (HTTPS),
          acces restricționat la datele stocate, ștergere automată la expirarea perioadei
          de retenție, minimizarea datelor trimise către furnizorii AI.
        </p>

        <h2 style={H}>8. Cookie-uri și stocare locală</h2>
        <p style={S}>
          Serviciul folosește stocarea locală a browserului (localStorage) pentru
          păstrarea progresului pe propriul dispozitiv. La finalizarea plății,
          procesatorul Creem poate seta cookie-uri strict necesare procesării tranzacției
          și prevenirii fraudei. Nu folosim cookie-uri de publicitate. Dacă vom introduce
          instrumente de analiză sau marketing, vom solicita consimțământul în prealabil
          printr-un banner dedicat.
        </p>

        <h2 style={H}>9. Modificări</h2>
        <p style={S}>
          Vom publica aici orice modificare a acestei politici, cu actualizarea datei din
          partea de sus a paginii.
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
