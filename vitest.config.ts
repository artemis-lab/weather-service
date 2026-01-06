import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["node_modules/", "dist/", "test/", "src/index.ts"],
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
