// server/plugins/db.ts
import { getDb } from "../utils/db";

export default defineNitroPlugin(() => {
  // Initialize DB connection once
  getDb();
  console.log("Database initialized in Nitro plugin");
});
