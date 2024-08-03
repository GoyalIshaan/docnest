import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  optimizeDeps: {
    include: ["draft-js", "react-draft-wysiwyg"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
