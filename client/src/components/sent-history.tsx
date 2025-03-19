import { useEffect } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";
import { Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function SentHistory() {
  const { messages } = useWebSocket();
  const { user } = useAuth();

  const { data: historyData, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  // Combine fetched history with real-time messages
  const combinedHistory = [
    ...(messages || []),
    ...(historyData || []),
  ].reduce((acc, curr) => {
    // Deduplicate by ID
    const exists = acc.find(item => item.id === curr.id);
    if (!exists) {
      acc.push(curr);
    }
    return acc;
  }, [] as Message[])
  .sort((a, b) => {
    // Sort by date, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
  .slice(0, 5); // Only show 5 most recent messages

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <Card className="shadow-lg rounded-3xl">
      <CardContent className="p-6">
        <h2 className="font-quicksand font-bold text-xl mb-4 flex items-center">
          <History className="h-5 w-5 mr-2 text-secondary" />
          Recent Thoughts
        </h2>
        
        <div className="space-y-4">
          {isLoading && (
            <>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-muted bg-opacity-30 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="ml-2 h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </>
          )}
          
          {combinedHistory.length === 0 && !isLoading && (
            <div className="text-center p-6 text-muted-foreground">
              <p>No thoughts sent or received yet.</p>
              <p className="text-sm mt-1">Start by sending one!</p>
            </div>
          )}
          
          {combinedHistory.map((message) => {
            const isSender = message.senderId === user?.id;
            const messageType = message.type;
            
            return (
              <div key={message.id} className="p-4 bg-muted bg-opacity-30 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 border-2 border-secondary">
                      <AvatarImage src={`/avatars/avatar-${(message.recipientId % 10) + 1}.png`} />
                      <AvatarFallback>
                        {isSender ? "TO" : "FROM"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 font-medium">
                      {isSender ? `To User #${message.recipientId}` : `From User #${message.senderId}`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                
                {messageType === 'emoticon' ? (
                  <div className="flex items-center">
                    <div className="text-4xl mr-3">{message.content}</div>
                    <div className="text-sm opacity-70">Sent an emoticon</div>
                  </div>
                ) : (
                  <div className="thought-bubble text-sm p-3 bg-white rounded-2xl relative mb-2">
                    {message.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {combinedHistory.length > 0 && (
          <Button variant="link" className="mt-4 w-full text-secondary hover:text-primary">
            View All History
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
