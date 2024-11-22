import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: integer("id").primaryKey(),
  name: text("name"),
  systemMessage: text("system_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  temperature: real("temperature").default(0.5),
  model: text("model").default("claude-3-5-sonnet-20241022"),
  maxTokens: integer("max_tokens").default(1024),
  userId: integer("user_id").references(() => users.id),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  content: text("content"),
  role: text("role"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const files = sqliteTable("files", {
  id: integer("id").primaryKey(),
  name: text("name"),
  path: text("path"),
  text: text("text"),
  tokens: integer("tokens"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey(),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  cacheCreationInputTokens: integer("cache_creation_input_tokens").default(0),
  cacheReadInputTokens: integer("cache_read_input_tokens").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  userId: integer("users_id").references(() => users.id),
});
