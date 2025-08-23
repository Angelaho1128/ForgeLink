import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: "src",
  publicDir: resolve(__dirname, "public"), // serve /assets/... from your existing public/
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // forwards /api requests to Node server during dev
      "/api": "http://localhost:8000",
    },
  },
});
