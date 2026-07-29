import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });
const testUrl = process.env.TEST_DATABASE_URL?.trim();
if (!testUrl) throw new Error("TEST_DATABASE_URL é obrigatória para E2E.");

// Guarda contra reavaliação deste módulo (ex: Playwright reimportando o
// config num worker filho): sem isso, a segunda avaliação compararia
// DATABASE_URL (já trocada pela primeira) com ela mesma e sempre falharia.
if (!process.env.__E2E_ENV_SWAPPED) {
  const productionUrl = process.env.DATABASE_URL?.trim();
  if (productionUrl && productionUrl === testUrl) throw new Error("TEST_DATABASE_URL não pode ser igual a DATABASE_URL.");
  process.env.__ORIGINAL_DATABASE_URL = productionUrl;
  process.env.DATABASE_URL = testUrl;
  process.env.__E2E_ENV_SWAPPED = "1";
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3018",
    trace: "retain-on-failure"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3018",
    url: "http://127.0.0.1:3018",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
