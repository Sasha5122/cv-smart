# CVexpres (rezumat în română)

Documentația completă e în engleză: [README.md](README.md).

**Ce e.** Un generator de CV-uri cu AI pentru piața din România, produs live cu plăți ([cvexpres.ro](https://www.cvexpres.ro)). AI-ul pune 5 întrebări de recrutor pe baza a ce a scris candidatul, apoi scrie 7 bullet-uri, iar un validator în cod verifică fiecare cifră față de textul candidatului. CV-ul iese ca PDF în 19 design-uri, plată unică (49 lei), livrare pe email cu link de re-descărcare valabil 30 de zile.

**Stack.** Next.js 16, React 19, TypeScript, Tailwind 4, Supabase, OpenAI (Structured Outputs), react-pdf, sharp, Creem (Merchant of Record), Resend, Upstash, Vercel, Playwright.

**De ce merită citit codul.**
- Pipeline AI în 2 apeluri + validare deterministă a cifrelor (anti-halucinare) cu regenerare țintită.
- Alegerea modelului pe baza unei matrice de 9 configurații × 4 cazuri: gpt-5.4 la 33% din costul gpt-5.5, calitate echivalentă ([docs/evaluation.md](docs/evaluation.md)).
- Plăți ca ledger idempotent, livrare pe două straturi, token HMAC fără JWT ([docs/decisions.md](docs/decisions.md)).
- Observabilitate: dashboard anonimizat cu cost, latență, funnel și erori, public cu date generate la [/demo/admin](https://www.cvexpres.ro/demo/admin).
- 55 de teste e2e cu AI mock-uit, CI pe fiecare push.

**Rulare locală.** Vezi secțiunea „Run locally" din [README.md](README.md).
