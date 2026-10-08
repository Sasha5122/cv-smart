# Costuri MĂSURATE per configurație (medie pe 4 cazuri, variantă liber)

| Config | Cost/job (¢) | Apel #1 (¢) | Apel #2+regen (¢) | Reasoning ap.1 | Reasoning ap.2 | Cached in | Regenerări |
|---|---|---|---|---|---|---|---|
| C0_baseline_55 | 6.47 | 1.90 | 4.57 | 0 | 681 | 0 | 2 |
| C1_55_effort_min | 5.91 | 1.91 | 4.01 | 21 | 611 | 0 | 1 |
| C2_54_full | 2.14 | 0.86 | 1.28 | 0 | 0 | 0 | 2 |
| C3_mini_54 | 1.38 | 0.26 | 1.12 | 0 | 0 | 0 | 1 |
| C4_mini_full | 0.57 | 0.25 | 0.31 | 0 | 0 | 0 | 1 |
| C5_51_full | 1.31 | 0.55 | 0.76 | 0 | 0 | 0 | 1 |
| C6_mini_51 | 0.95 | 0.24 | 0.71 | 0 | 0 | 288 | 1 |
| C7_nano_54 | 1.30 | 0.09 | 1.21 | 0 | 0 | 320 | 2 |
| C8_51_54 | 1.66 | 0.58 | 1.09 | 0 | 0 | 0 | 1 |

Reasoning = tokeni de gândire invizibilă (facturați ca output). Regenerări = apeluri suplimentare cauzate de validarea cifrelor (numărate pe toate cele 4 cazuri).

## C0 vs C1 — defalcare pe cazuri (a meritat „effort minimal”?)

| Caz | C0 cost (¢) | C0 reasoning | C1 cost (¢) | C1 reasoning | effort respins? |
|---|---|---|---|---|---|
| caz1_contabil_fara_anunt | 5.66 | 512 | 5.36 | 512 | DA → a rulat ca C0 |
| caz2_contabil_cu_anunt | 5.99 | 380 | 6.77 | 1024 | DA → a rulat ca C0 |
| caz3_raspunsuri_sarace | 3.69 | 0 | 3.80 | 0 | DA → a rulat ca C0 |
| caz4_sofer_profesionist | 10.53 | 1830 | 7.72 | 990 | DA → a rulat ca C0 |
