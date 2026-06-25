import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relatif pour fonctionner aussi bien en local qu'en sous-dossier (GitHub Pages).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
