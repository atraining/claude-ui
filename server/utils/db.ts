import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../database/schema";

let db: ReturnType<typeof drizzle>;

// Singleton pattern
export function getDb() {
  if (!db) {
    const sqlite = new Database(useRuntimeConfig().databaseUrl);
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    console.log("New database connection established");
  }
  return db;
}

export default getDb();
