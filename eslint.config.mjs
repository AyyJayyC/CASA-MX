import nextPlugin from "@next/eslint-plugin-next";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = [
  {
    name: "casa-mx/ignores",
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "test-results/**",
      "coverage/**",
      ".opencode/**",
      ".specify/**",
      "scripts/generate-brand-assets.ps1",
    ],
  },
  {
    name: "casa-mx/base",
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    name: "casa-mx/react-hooks",
    files: ["**/*.jsx", "**/*.tsx"],
    plugins: {
      "react-hooks": (await import("eslint-plugin-react-hooks")).default,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
