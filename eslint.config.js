// eslint.config.js
import globals from "globals";
import js from "@eslint/js";

export default [
  // Menggunakan aturan yang direkomendasikan dari ESLint
  js.configs.recommended,

  {
    languageOptions: {
      // Menggunakan versi JavaScript terbaru
      ecmaVersion: "latest",
      // Menggunakan module (import/export)
      sourceType: "module",
      // Menentukan bahwa ini adalah lingkungan Node.js
      globals: {
        ...globals.node
      }
    },
    // Di sini lo bisa nambahin aturan sendiri nanti
    rules: {
    "semi": ["error", "always"]
    }
  }
];