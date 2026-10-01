import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts", "src/**/*.test.ts", "scripts/**/*.spec.ts"],
    environment: "node",
  },
});
