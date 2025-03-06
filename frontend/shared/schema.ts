import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type ConversationType = "private" | "group";

export const conversations = pgTable("conversations", {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name"), // Null for private chats, required for groups
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationMembers = pgTable("conversation_members", {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull(),
    userId: integer("user_id").notNull(),
    role: text("role").default("member").notNull(), // 'member' or 'admin' for groups
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    translatedContent: text("translated_content"),
    fromLanguage: text("from_language").notNull(),
    toLanguage: text("to_language").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    sender: text("sender").notNull(),
    conversationId: integer("conversation_id").notNull(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),

    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    defaultLanguage: text("default_language").notNull().default("fr"),
    languageLevel: text("language_level").notNull().default("standard"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
    id: true,
    timestamp: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
    id: true,
    createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AuthUser = User & {
    token: string;
};
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const supportedLanguages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
] as const;

export const languageLevels = [
    { code: "casual", name: "Familier" },
    { code: "standard", name: "Courant" },
    { code: "formal", name: "Soutenu" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];
export type LanguageLevel = (typeof languageLevels)[number]["code"];