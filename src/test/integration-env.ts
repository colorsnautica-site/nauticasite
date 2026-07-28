import { config } from "dotenv";

config({ path: ".env.local" });
const productionUrl = process.env.DATABASE_URL?.trim();
const testUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testUrl) throw new Error("TEST_DATABASE_URL é obrigatória para testes de integração.");
if (productionUrl && testUrl === productionUrl) {
  throw new Error("TEST_DATABASE_URL não pode ser igual a DATABASE_URL.");
}

process.env.DATABASE_URL = testUrl;
