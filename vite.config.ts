import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Strips "use client" / "use server" directives from node_modules before
// Vite/esbuild tries to bundle them — prevents build failures.
function stripModuleDirectivesPlugin(): Plugin {
  return {
    name: "strip-module-directives",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("node_modules")) return null;
      const stripped = code.replace(
        /^\s*["']use client["'];?\s*\n?/gm,
        ""
      );
      if (stripped === code) return null;
      return { code: stripped, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    stripModuleDirectivesPlugin(),
    tanstackStart({
      server: {
        preset: "vercel",
      },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
