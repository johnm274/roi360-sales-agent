import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const partners = sqliteTable('partners', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    companyName: text('company_name'),
    sectors: text('sectors'), // JSON array
    strengths: text('strengths'),
    notes: text('notes'),
    isAdmin: integer('is_admin', { mode: 'boolean' })
        .notNull()
        .default(false),
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey(),
    partnerId: text('partner_id')
        .notNull()
        .references(() => partners.id),
    title: text('title'),
    useCase: text('use_case'),
    outputMode: text('output_mode').notNull().default('standard'),
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
        .notNull()
        .references(() => conversations.id),
    role: text('role').notNull(), // user, assistant, system, tool
    content: text('content').notNull(),
    toolCalls: text('tool_calls'), // JSON
    metadata: text('metadata'), // JSON
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const partnerContext = sqliteTable('partner_context', {
    id: text('id').primaryKey(),
    partnerId: text('partner_id')
        .notNull()
        .references(() => partners.id),
    contextKey: text('context_key').notNull(),
    contextValue: text('context_value').notNull(),
    source: text('source'), // user_input, ai_extracted, admin
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const knowledgeFiles = sqliteTable('knowledge_files', {
    id: text('id').primaryKey(),
    filename: text('filename').notNull().unique(),
    category: text('category').notNull(),
    content: text('content').notNull().default(''),
    contentHash: text('content_hash'),
    lastIndexedAt: text('last_indexed_at'),
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});
