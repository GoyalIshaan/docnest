import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  define: {
    global: {},
  },
  optimizeDeps: {
    include: ["draft-js", "react-draft-wysiwyg"],
    exclude: ["@automerge/automerge-wasm"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: "esnext",
  },
});
