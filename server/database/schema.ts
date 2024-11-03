import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const threads = sqliteTable('threads', {
    id: integer('id').primaryKey(),
    name: text('name'),
    systemMessage: text('system_message'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const messages = sqliteTable('messages', {
    id: integer('id').primaryKey(),
    content: text('content'),
    role: text('role'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    threadId: integer('thread_id').notNull(),
})