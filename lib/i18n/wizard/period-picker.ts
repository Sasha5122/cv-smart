import type { Locale } from "@/lib/i18n/locale";

const ro = {
  /** etichete afișate pentru luni — valorile stocate rămân numele românești (MONTHS) */
  months: [
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
    "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
  ],
  monthOptional: "luna (opțional)",
  year: "anul",
  from: "De când",
  to: "Până când",
  /** eticheta opțiunii „Prezent" — valoarea stocată rămâne "Prezent" */
  present: "Prezent",
  /** forma din textul perioadei: „2020 – prezent" */
  presentInPeriod: "prezent",
};

const en: typeof ro = {
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthOptional: "month (optional)",
  year: "year",
  from: "From",
  to: "Until",
  present: "Present",
  presentInPeriod: "present",
};

export const PERIOD_PICKER_MESSAGES: Record<Locale, typeof ro> = { ro, en };
