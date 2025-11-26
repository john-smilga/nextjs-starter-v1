import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import customPlugin from "./eslint-rules/index.js";

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
    "eslint-rules/**", // Ignore custom ESLint rules directory
  ]),
  {
    plugins: {
      "custom": customPlugin,
    },
    rules: {
      "custom/no-relative-imports": "error",
    },
  },
]);

export default eslintConfig;
