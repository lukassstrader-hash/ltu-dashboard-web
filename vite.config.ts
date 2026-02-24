import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    target: "es2015",
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      external: [],
    },
  },
});
