import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dbCredentials: {
		url: process.env.DATABASE_URL || "./database.db",
	},
} satisfies Config;
