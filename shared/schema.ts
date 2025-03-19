import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar").default("/default-avatar.png"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  type: text("type").notNull(), // 'emoticon' or 'thought'
  content: text("content").notNull(),
  seen: boolean("seen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  type: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Extended schemas with validation
export const loginSchema = insertUserSchema;

export const registerSchema = insertUserSchema;

export const messagePayloadSchema = z.object({
  recipientId: z.number(),
  type: z.enum(['emoticon', 'thought']),
  content: z.string().max(100),
});

export type MessagePayload = z.infer<typeof messagePayloadSchema>;
