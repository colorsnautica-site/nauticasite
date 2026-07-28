import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["./src/test/integration-env.ts"],
    fileParallelism: false
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } }
});
