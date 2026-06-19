/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"] }), react()],
  test: {
    // Default environment for component tests
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Per-file environment overrides via @vitest-environment docblock
    environmentMatchGlobs: [
      ["src/app/api/**/*.test.ts", "node"],
      ["src/lib/rate-limit.test.ts", "node"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        // Generated / config files
        "src/app/layout.tsx",
        "src/app/globals.css",
        "src/middleware.ts",
        // Firebase config (external service)
        "src/lib/firebase/**",
        // Type-only files
        "src/**/**/types/**",
        "src/config/**",
      ],
      // Current baseline — raise as more tests are added
      thresholds: {
        lines: 10,
        functions: 8,
        branches: 8,
        statements: 10,
      },
    },
  },
});
