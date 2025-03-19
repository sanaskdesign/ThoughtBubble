import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { WebSocketProvider } from "@/lib/websocket";
import RecipientSearch from "@/components/recipient-search";
import MessageComposer from "@/components/message-composer";
import SentHistory from "@/components/sent-history";
import NotificationsBadge from "@/components/notifications-badge";
import SendingAnimation from "@/components/sending-animation";
import SuccessMessage from "@/components/success-message";
import { motion } from "framer-motion";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) return null;

  return (
    <WebSocketProvider>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-background">
        <div className="w-full max-w-md flex justify-between items-center mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="logo flex items-center"
          >
            <span className="text-3xl mr-2">🌸</span>
            <h1 className="font-quicksand font-bold text-2xl text-primary">ThoughtBubble</h1>
          </motion.div>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center"
          >
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={user.avatar || undefined} alt={user.username} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2 focus:outline-none text-muted-foreground hover:text-primary">
                <Menu size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <RecipientSearch 
            selectedRecipient={selectedRecipient} 
            onSelectRecipient={setSelectedRecipient} 
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <MessageComposer 
            selectedRecipient={selectedRecipient}
            onSending={() => setIsSending(true)}
            onSent={(recipient) => {
              setIsSending(false);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 3000);
            }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <SentHistory />
        </motion.div>

        <NotificationsBadge />

        {isSending && <SendingAnimation />}
        
        {showSuccess && (
          <SuccessMessage 
            recipientName={selectedRecipient?.username || "your friend"}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </div>
    </WebSocketProvider>
  );
}
