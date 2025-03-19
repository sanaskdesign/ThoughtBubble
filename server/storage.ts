import { users, type User, type InsertUser, messages, type Message, type InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  findUsers(query: string): Promise<User[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForUser(userId: number): Promise<Message[]>;
  getUnseenMessagesCount(userId: number): Promise<number>;
  markMessageAsSeen(messageId: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Using any for SessionStore due to typing issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  currentUserId: number;
  currentMessageId: number;
  sessionStore: any; // Using any type for session store

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, avatar: `/avatars/avatar-${Math.floor(Math.random() * 10) + 1}.png` };
    this.users.set(id, user);
    return user;
  }

  async findUsers(query: string): Promise<User[]> {
    if (!query) return [];
    return Array.from(this.users.values()).filter(
      (user) => user.username.toLowerCase().includes(query.toLowerCase())
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      seen: false,
      createdAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesForUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.recipientId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
  }

  async getUnseenMessagesCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(msg => msg.recipientId === userId && !msg.seen)
      .length;
  }

  async markMessageAsSeen(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.seen = true;
      this.messages.set(messageId, message);
    }
  }
}

export const storage = new MemStorage();
