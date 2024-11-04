import { sqliteTable, text, integer, real  } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: integer("id").primaryKey(),
  name: text("name"),
  systemMessage: text("system_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  temperature: real("temperature").default(0.5),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  content: text("content"),
  role: text("role"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  threadId: integer("thread_id").notNull(),
});

export const files = sqliteTable("files", {
  id: integer("id").primaryKey(),
  name: text("name"),
  path: text("path"),
  text : text("text"),
  tokens : integer('tokens'),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  threadId: integer("thread_id").notNull(),
});
