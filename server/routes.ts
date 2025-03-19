import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { messagePayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

interface WebSocketWithId extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes
  setupAuth(app);

  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const clients = new Map<number, WebSocketWithId>();

  wss.on('connection', (ws: WebSocketWithId) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          // Store the user ID with the connection
          ws.userId = data.userId;
          clients.set(data.userId, ws);
          
          // Send unseen messages count
          const unseenCount = await storage.getUnseenMessagesCount(data.userId);
          ws.send(JSON.stringify({
            type: 'notifications',
            count: unseenCount
          }));
        } else if (data.type === 'message' && ws.userId) {
          // Validate message payload
          const payload = messagePayloadSchema.parse(data.payload);
          
          // Save message to storage
          const savedMessage = await storage.createMessage({
            senderId: ws.userId,
            recipientId: payload.recipientId,
            type: payload.type,
            content: payload.content
          });
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: savedMessage
          }));
          
          // Notify recipient if they're online
          const recipientWs = clients.get(payload.recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'new_message',
              message: savedMessage
            }));
            
            // Update notifications count for recipient
            const unseenCount = await storage.getUnseenMessagesCount(payload.recipientId);
            recipientWs.send(JSON.stringify({
              type: 'notifications',
              count: unseenCount
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: validationError.message 
          }));
        } else {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'An error occurred processing your request' 
          }));
        }
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });
  });

  // API endpoint to find a user by exact username
  app.get("/api/users/find/:username", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.id === req.user.id) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive data
    const { password, ...safeUser } = user;
    
    res.json(safeUser);
  });

  // API endpoint to get message history
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const messages = await storage.getMessagesForUser(req.user.id);
    res.json(messages);
  });

  // API endpoint to mark a message as seen
  app.post("/api/messages/:id/seen", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const messageId = parseInt(req.params.id, 10);
    if (isNaN(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    
    await storage.markMessageAsSeen(messageId);
    
    // Return updated unseen count
    const unseenCount = await storage.getUnseenMessagesCount(req.user.id);
    res.json({ unseenCount });
  });

  return httpServer;
}
