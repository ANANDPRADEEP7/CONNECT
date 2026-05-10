// eslint.config.cjs – ESLint flat config (CommonJS, compatible with ts-node + CommonJS tsconfig)
const tsParser  = require("@typescript-eslint/parser");
const tsPlugin  = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  // ── TypeScript source files ─────────────────────────────────────────────────
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Prettier formatting enforced as lint error
      "prettier/prettier": "error",

      // Project-specific tweaks
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Disable ESLint rules that conflict with Prettier
  prettierConfig,

  // Global ignores
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
