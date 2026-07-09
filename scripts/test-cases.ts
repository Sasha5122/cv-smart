/** Cazurile de test partajate (test-pipeline.ts + test-model-matrix.ts). */

export const SAMPLE_JD = `Căutăm Contabil Senior pentru biroul nostru din București.
Cerințe: experiență minim 3 ani în contabilitate completă, cunoștințe solide de legislație fiscală (declarații D112, D300, D394), experiență cu programe de contabilitate (Saga constituie avantaj), atenție la detalii, capacitate de a gestiona un portofoliu de clienți multipli. Responsabilități: înregistrarea documentelor contabile, întocmirea și depunerea declarațiilor fiscale, închideri lunare, comunicare directă cu clienții și cu ANAF, verificarea lucrărilor colegilor juniori.`;

export interface TestCase {
  slug: string;
  name: string;
  jobTitle: string;
  company?: string;
  period?: string;
  industry: string;
  years: number;
  raw: string;
  answers: string[];
  jd?: string;
}

const RAW_CONTABIL_COLOCVIAL = `lucrez la o firma unde ma ocup de contabilitate de la facturi pana la declaratii. bag lunar cam 900-1000 de facturi de furnizori si vreo 350-400 emise catre clienti, plus vreo 600 de nir-uri si 700-800 bonuri de consum. fac declaratiile lunare d112, d300, d394 si d390 doar cand avem operatiuni intracomunitare, si verific jurnalele de tva. la inchidere de luna fac verificari de solduri pe furnizori, stocuri si casa-banca, punctaje si note de corectie. lucrez in saga si excel cu vlookup, pivot si sumif. tin legatura cu anaf cand sunt controale sau cereri si mai ajut hr-ul cu pontajele. suntem 4 in echipa financiar-contabila.`;

/** Numerotarea din instrucțiunea de matrice:
 * 1 fără anunț · 2 cu anunț · 3 răspunsuri sărace · 4 alt domeniu */
export const MATRIX_CASES: TestCase[] = [
  {
    slug: "caz1_contabil_fara_anunt",
    name: "Contabil fără anunț",
    jobTitle: "Contabil",
    company: "SC ContExpert SRL",
    period: "2021 – prezent",
    industry: "Financiar & Contabilitate",
    years: 3,
    raw: RAW_CONTABIL_COLOCVIAL,
    answers: [
      "am gasit si rezolvat o diferenta de vreo 38 de mii de lei pe contul de furnizori, am verificat luna cu luna, am facut corectii si am confirmat punctajul cu furnizorii",
      "dupa chestia asta contabilul sef imi da mie toate reconcilierile mai dificile",
      "declaratiile le intocmesc si le depun eu cap coada, singura, de vreo 3 ani",
      "in saga fac tot: facturi, nir-uri, bonuri de consum, jurnale tva, fise de cont",
      "pregatesc documentele cand vin controale de la anaf si fac pontajele pentru hr",
    ],
  },
  {
    slug: "caz2_contabil_cu_anunt",
    name: "Contabil cu anunț de job",
    jobTitle: "Contabil",
    industry: "Contabilitate / Servicii financiare",
    years: 5,
    jd: SAMPLE_JD,
    raw: `ma ocup de contabilitatea primara si declaratii pentru mai multe firme mici. bag facturi in program, fac pontaje si salarii pentru angajatii clientilor, depun declaratii la anaf in fiecare luna. tin legatura cu clientii pe mail si telefon cand au nevoie de acte sau cand au probleme cu anaf. la inchidere de luna fac balante si verific conturile. am invatat singura saga si acum lucrez repede in el.`,
    answers: [
      "procesez cam 300 de facturi pe luna in total si fac declaratiile D112, D300 si D394 pentru 12 firme",
      "lucrez zilnic in Saga si Excel, depun prin SPV, si la doi clienti folosesc SmartBill pentru facturare",
      "coordonez o colega junioara, ii verific lucrarile si am invatat-o sa depuna declaratii singura",
      "am reusit sa anulez o amenda de 8000 lei dupa ce am refacut si redepus declaratiile unui client, si am scurtat inchiderea de luna de la 10 zile la 6 zile",
      "firma de contabilitate cu 6 angajati, clientii sunt SRL-uri mici din retail si constructii",
    ],
  },
  {
    slug: "caz3_raspunsuri_sarace",
    name: "Răspunsuri sărace (testul de invenție)",
    jobTitle: "Contabil",
    industry: "Financiar & Contabilitate",
    years: 3,
    raw: RAW_CONTABIL_COLOCVIAL,
    answers: ["nu stiu exact", "", "nimic special", "nu imi amintesc cifre", ""],
  },
  {
    slug: "caz4_sofer_profesionist",
    name: "Șofer profesionist (alt domeniu)",
    jobTitle: "Șofer profesionist",
    company: "firmă de transport internațional (actuala, de 5 ani)",
    period: "2021 – prezent",
    industry: "Transport & Logistică",
    years: 8,
    raw: `sunt sofer de tir de vreo 8 ani, am categoria C si CE si atestat de marfa. fac curse internationale, mai mult germania, olanda si belgia, cam 3 saptamani plecat si o saptamana acasa. duc marfa generala pe prelata, cateodata si frig. imi fac singur documentele de transport, cmr, si ma descurc cu descarcatul la rampe. am grija de camion, verific uleiul, presiunea, si anunt din timp daca e ceva de reparat. n-am avut accidente din vina mea si nici amenzi mari. patronul ma trimite pe cursele mai lungi ca stie ca nu fac probleme.`,
    answers: [
      "cam 10-11 mii de km pe luna, camion volvo fh de 460 de cai cu cutie automata",
      "am card de tahograf si respect timpii de condus, 4 ore jumate si pauza, nu am avut nicio amenda pe tahograf in 8 ani",
      "incarc si descarc cu liftul din spate cand e cazul, si stiu sa asigur marfa cu chingi si colturi, am facut si adr acum 2 ani dar nu l-am folosit inca",
      "vorbesc putina germana si engleza cat sa ma inteleg la rampe si cu politia",
      "am lucrat la 2 firme in 8 ani, la actuala sunt de 5 ani, avem vreo 15 camioane si 20 de soferi",
    ],
  },
];
