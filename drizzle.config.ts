import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// "dotenv/config" só carrega .env por padrão; nosso segredo real vive em
// .env.local (gerado pelo `vercel env pull`), então carregamos explicitamente.
config({ path: ".env.local" });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! }
} satisfies Config;
