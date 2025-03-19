import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message, MessagePayload } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  sendMessage: (payload: MessagePayload) => void;
  messages: Message[];
  unseenCount: number;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Authenticate WebSocket connection
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message_sent':
          // Add the sent message to our local state
          setMessages(prev => [data.message, ...prev]);
          toast({
            title: 'Thought sent!',
            description: 'Your message has been delivered.',
          });
          break;
          
        case 'new_message':
          // Add the new message to our local state
          setMessages(prev => [data.message, ...prev]);
          toast({
            title: 'New thought!',
            description: 'Someone just sent you a thought.',
          });
          break;
          
        case 'notifications':
          // Update unseen count
          setUnseenCount(data.count);
          break;
          
        case 'error':
          toast({
            title: 'Error',
            description: data.message,
            variant: 'destructive',
          });
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to messaging service',
        variant: 'destructive',
      });
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [user, toast]);

  // Function to send messages through WebSocket
  const sendMessage = useCallback((payload: MessagePayload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        payload
      }));
    } else {
      toast({
        title: 'Connection error',
        description: 'Not connected to messaging service',
        variant: 'destructive',
      });
    }
  }, [socket, toast]);

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      messages,
      unseenCount,
      connected
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
