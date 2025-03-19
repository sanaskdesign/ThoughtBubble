import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Heart, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface RecipientSearchProps {
  selectedRecipient: User | null;
  onSelectRecipient: (recipient: User) => void;
}

export default function RecipientSearch({ selectedRecipient, onSelectRecipient }: RecipientSearchProps) {
  const [username, setUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: user, isLoading, error } = useQuery<User | undefined>({
    queryKey: ["/api/users/find", username],
    queryFn: async ({ queryKey }) => {
      if (!username.trim()) return undefined;
      try {
        const res = await fetch(`/api/users/find/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error("User not found");
        const userData: User = await res.json();
        return userData;
      } catch (err) {
        throw new Error("User not found");
      }
    },
    enabled: isSearching,
    retry: false
  });
  
  // Reset search state when query settles
  useEffect(() => {
    if (!isLoading && isSearching) {
      setIsSearching(false);
    }
  }, [isLoading, isSearching]);

  const handleSearch = () => {
    if (username.trim().length > 0) {
      setIsSearching(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="mb-6 shadow-lg rounded-3xl">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
          <h2 className="font-quicksand font-bold text-xl">Send a thought to your partner</h2>
          <p className="text-sm text-muted-foreground">Enter their username to send them a special thought</p>
        </div>
        
        <div className="relative mb-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your partner's username"
            className="py-6 rounded-xl border-2 border-neutral focus:border-primary transition-colors text-center"
          />
        </div>
        
        <Button 
          onClick={handleSearch}
          disabled={isLoading || username.trim().length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Send className="h-5 w-5 mr-2" />
          )}
          Find Partner
        </Button>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-red-500 text-sm"
          >
            User not found. Please check the username and try again.
          </motion.div>
        )}
        
        {user && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center p-4 bg-muted rounded-xl cursor-pointer transition-colors"
            onClick={() => onSelectRecipient(user)}
          >
            <Avatar className="h-16 w-16 border-3 border-primary mb-2">
              <AvatarImage src={user.avatar || undefined} alt={user.username} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="font-medium text-foreground text-lg">{user.username}</p>
            <p className="text-sm text-muted-foreground mb-2">@{user.username.toLowerCase()}</p>
            <Button 
              size="sm" 
              variant="outline"
              className="mt-2 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRecipient(user);
              }}
            >
              Select Partner
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
