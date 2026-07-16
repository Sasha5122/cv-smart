import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { LEGAL } from "@/lib/legal-config";

export const metadata = {
  title: "Termeni și condiții — CVexpres",
  description:
    "Termenii și condițiile de utilizare a serviciului CVexpres: preț, plată unică, drept de retragere, protecția datelor, răspundere.",
};

const S: React.CSSProperties = { fontSize: 15, lineHeight: 1.75, color: "var(--muted-foreground)", marginBottom: 14 };
const H: React.CSSProperties = { fontSize: 20, fontWeight: 700, margin: "34px 0 12px", color: "var(--foreground)" };
const LI: React.CSSProperties = { ...S, marginBottom: 8 };

export default function TermeniPage() {
  return (
    <>
      <LandingHeader />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 96px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Termeni și condiții
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--faint)", marginBottom: 28 }}>
          Ultima actualizare: 15 iulie 2026 · Versiunea 1.0
        </p>

        <h2 style={H}>1. Cine suntem și ce reglementează acest document</h2>
        <p style={S}>
          Acești termeni și condiții („Termenii") reglementează utilizarea serviciului
          CVexpres, disponibil la adresa acestui site („Serviciul"). Serviciul este operat
          de {LEGAL.operatorName}, {LEGAL.operatorType}, email {LEGAL.contactEmail},
          telefon {LEGAL.contactPhone} („Operatorul", „noi"). Prin utilizarea Serviciului
          și, în special, prin bifarea căsuței de acceptare înainte de generarea CV-ului,
          confirmați că ați citit, ați înțeles și acceptați integral acești Termeni. Dacă
          nu sunteți de acord, vă rugăm să nu utilizați Serviciul.
        </p>
        <p style={S}>
          Termenii sunt redactați în conformitate cu legislația română și a Uniunii
          Europene aplicabilă, inclusiv: OUG nr. 34/2014 privind drepturile consumatorilor
          în contractele încheiate cu profesioniștii, Legea nr. 365/2002 privind comerțul
          electronic, OUG nr. 141/2021 privind furnizarea de conținut digital și servicii
          digitale (transpunerea Directivei (UE) 2019/770), Regulamentul (UE) 2016/679
          („GDPR") și Regulamentul (UE) 2024/1689 privind inteligența artificială („AI Act").
        </p>

        <h2 style={H}>2. Descrierea Serviciului</h2>
        <p style={S}>
          CVexpres este un serviciu online care generează curriculum vitae (CV) în format
          PDF, pe baza informațiilor furnizate de dumneavoastră (date de contact,
          experiență profesională, educație, abilități, limbi străine și altele), prelucrate
          cu ajutorul unor modele de inteligență artificială. Rezultatul este un document
          personalizat, formulat profesional, pe care îl puteți descărca în format PDF.
        </p>
        <p style={S}>
          <strong>Transparență privind inteligența artificială:</strong> în conformitate cu
          AI Act, vă informăm că textele din CV (rezumat, descrierea responsabilităților,
          abilități) sunt generate sau reformulate cu ajutorul inteligenței artificiale, pe
          baza informațiilor pe care le furnizați. Aveți posibilitatea și responsabilitatea
          de a verifica și edita conținutul înainte de descărcare.
        </p>

        <h2 style={H}>3. Preț și plată</h2>
        <p style={S}>
          Prețul Serviciului este {LEGAL.priceText}, cu TVA inclus. Plata este{" "}
          <strong>unică</strong>: nu există abonamente, plăți recurente sau costuri
          ascunse. Prețul afișat la momentul plasării comenzii este prețul final.
          Operatorul poate modifica prețul pentru comenzile viitoare; modificarea nu
          afectează comenzile deja plătite.
        </p>
        <p style={S}>
          Plățile sunt procesate de Paddle.com Market Ltd. („Paddle"), care acționează ca
          Merchant of Record — vânzătorul înregistrat al tranzacției. Factura fiscală este
          emisă de Paddle, iar tranzacția apare pe extrasul de card cu denumirea
          PADDLE.COM. Termenilor de cumpărare Paddle (paddle.com/legal/checkout-buyer-terms)
          li se aplică procesarea plății.
        </p>

        <h2 style={H}>4. Încheierea contractului și livrarea</h2>
        <p style={S}>
          Contractul se încheie în momentul în care confirmați comanda și acceptați acești
          Termeni. Livrarea conținutului digital (CV-ul în format PDF) se face imediat
          după generare, prin descărcare directă pe dispozitivul dumneavoastră.
        </p>

        <h2 style={H}>5. Dreptul de retragere</h2>
        <p style={S}>
          Conform art. 16 lit. m) din OUG nr. 34/2014, dreptul de retragere de 14 zile
          <strong> nu se aplică</strong> contractelor de furnizare de conținut digital care
          nu este livrat pe un suport material, dacă executarea a început cu acordul
          prealabil expres al consumatorului și cu confirmarea acestuia că își pierde
          dreptul de retragere. Prin bifarea căsuței de acceptare și prin generarea
          CV-ului, vă exprimați acordul expres pentru executarea imediată a contractului
          și confirmați că înțelegeți că vă pierdeți dreptul de retragere din momentul
          descărcării documentului.
        </p>

        <h2 style={H}>6. Conformitatea conținutului digital și remedii</h2>
        <p style={S}>
          În temeiul OUG nr. 141/2021, răspundem pentru conformitatea conținutului digital
          livrat. Dacă CV-ul generat prezintă o neconformitate (de exemplu, fișierul PDF
          este corupt, nu poate fi descărcat sau nu corespunde descrierii Serviciului),
          aveți dreptul, în această ordine, la: (a) aducerea în conformitate (regenerarea
          documentului), (b) reducerea corespunzătoare a prețului sau (c) rezoluțiunea
          contractului cu rambursarea prețului. Ne puteți contacta pentru orice
          neconformitate prin pagina de Contact.
        </p>
        <p style={S}>
          Garanția noastră: dacă nu primiți CV-ul generat în format PDF valid și
          descărcabil, rambursăm integral prețul plătit. Întrucât aveți posibilitatea de a
          previzualiza și edita integral conținutul CV-ului înainte de plată, aprecierea
          subiectivă ulterioară asupra formulărilor nu constituie neconformitate în sensul
          prezentei secțiuni. Detalii complete în{" "}
          <Link href="/refund" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Politica de rambursare
          </Link>
          .
        </p>

        <h2 style={H}>7. Responsabilitățile dumneavoastră</h2>
        <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
          <li style={LI}>să furnizați informații reale, corecte și complete despre propria persoană;</li>
          <li style={LI}>să nu introduceți date personale ale altor persoane fără temei legal;</li>
          <li style={LI}>să verificați conținutul CV-ului înainte de a-l descărca și utiliza;</li>
          <li style={LI}>să nu utilizați Serviciul în scopuri ilegale, frauduloase sau abuzive (inclusiv crearea de identități false);</li>
          <li style={LI}>să nu încercați să perturbați funcționarea Serviciului sau să accesați neautorizat sistemele acestuia.</li>
        </ul>

        <h2 style={H}>8. Limitarea răspunderii</h2>
        <p style={S}>
          CV-ul este generat pe baza informațiilor furnizate de dumneavoastră; nu garantăm
          obținerea unui loc de muncă, invitații la interviuri sau orice alt rezultat
          profesional. Nu răspundem pentru deciziile angajatorilor sau ale terților.
          Răspunderea noastră totală față de dumneavoastră este limitată la valoarea
          efectiv plătită pentru Serviciu, cu excepția cazurilor în care legea interzice o
          asemenea limitare (de exemplu, prejudicii cauzate cu intenție sau din culpă
          gravă, ori vătămări corporale). Nimic din acești Termeni nu limitează drepturile
          pe care vi le conferă legislația privind protecția consumatorilor.
        </p>

        <h2 style={H}>9. Protecția datelor cu caracter personal</h2>
        <p style={S}>
          Prelucrarea datelor dumneavoastră personale este descrisă în{" "}
          <Link href="/confidentialitate" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Politica de confidențialitate
          </Link>
          , parte integrantă a acestor Termeni. Pe scurt: datele introduse sunt folosite
          exclusiv pentru generarea CV-ului; datele sesiunilor sunt{" "}
          <strong>șterse automat după 30 de zile</strong> de la ultima activitate; nu
          vindem datele și nu le folosim în scopuri de marketing.
        </p>

        <h2 style={H}>10. Proprietate intelectuală</h2>
        <p style={S}>
          CV-ul generat vă aparține și îl puteți utiliza nelimitat în scop personal și
          profesional. Elementele Serviciului (denumire, design, cod, șabloane) rămân
          proprietatea Operatorului și nu pot fi copiate sau reutilizate fără acord scris.
        </p>

        <h2 style={H}>11. Disponibilitatea Serviciului</h2>
        <p style={S}>
          Depunem eforturi rezonabile pentru ca Serviciul să fie disponibil permanent, dar
          nu garantăm funcționarea neîntreruptă (mentenanță, defecțiuni ale furnizorilor de
          infrastructură sau ale modelelor AI). Dacă o întrerupere împiedică livrarea unui
          CV deja plătit, veți primi regenerarea documentului sau rambursarea prețului.
        </p>

        <h2 style={H}>12. Soluționarea litigiilor</h2>
        <p style={S}>
          Orice sesizare se transmite mai întâi prin pagina de Contact; răspundem în cel
          mult 14 zile. Aveți dreptul să vă adresați Autorității Naționale pentru
          Protecția Consumatorilor (ANPC — <strong>anpc.ro</strong>), să apelați la
          mecanismele de soluționare alternativă a litigiilor (SAL — Direcția de
          soluționare alternativă a litigiilor din cadrul ANPC) sau instanțelor
          judecătorești competente. Legea aplicabilă este legea română, fără a vă priva de
          protecția dispozițiilor imperative din statul membru UE în care aveți reședința
          obișnuită.
        </p>

        <h2 style={H}>13. Modificarea Termenilor</h2>
        <p style={S}>
          Putem actualiza acești Termeni (de exemplu, la schimbări legislative sau ale
          Serviciului). Versiunea aplicabilă unei comenzi este cea acceptată la momentul
          plasării acesteia. Data ultimei actualizări este afișată în partea de sus a
          acestei pagini.
        </p>

        <h2 style={H}>14. Contact</h2>
        <p style={S}>
          Pentru orice întrebare legată de acești Termeni, ne puteți scrie prin{" "}
          <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
            pagina de Contact
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
