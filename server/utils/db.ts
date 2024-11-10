import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../database/schema';

const dbUrl = useRuntimeConfig().databaseUrl
const db = drizzle(
    new Database(dbUrl),
    { schema }
)

export default db