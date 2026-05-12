import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "TajaddinReactComponents",
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "index.js" : "index.umd.cjs"),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "components.css";
          return assetInfo.name ?? "asset";
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
