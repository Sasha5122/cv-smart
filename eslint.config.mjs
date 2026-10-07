import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // scripturi de tooling (audituri vizuale, generatoare) — nu fac parte din aplicație
    "scripts/**",
  ]),
  {
    rules: {
      // Textele legale în română folosesc ghilimele în JSX; regula e doar stilistică.
      "react/no-unescaped-entities": "off",
      // Datorie tehnică cunoscută (cv-preview.tsx, step-14-draft.tsx): raportată, nu blocantă.
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
