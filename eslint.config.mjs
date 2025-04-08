  // Changed from "eslint/config"
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      "no-unused-vars": "error",
      "no-undef": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off"
    }
  }
]);