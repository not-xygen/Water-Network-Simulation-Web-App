// vitest.config.ts
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "src/components/**/*",
        "src/pages/**/*",
        "src/layouts/**/*",
        "src/styles/**/*",
        "src/assets/**/*",
        "src/types/**/*",
        "src/lib/supabase/**/*",
        "src/lib/engine/v1.ts",
        "src/lib/engine/v2.ts",
        "src/lib/engine/v3.ts",
        "src/main.tsx",
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
