import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        home: new URL("./index.html", import.meta.url).pathname,
        cloudPortfolio: new URL("./cloud-portfolio.html", import.meta.url).pathname,
        homelabGitops: new URL("./homelab-gitops.html", import.meta.url).pathname,
      },
    },
  },
});
