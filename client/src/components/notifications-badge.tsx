import { useWebSocket } from "@/lib/websocket";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotificationsBadge() {
  const { unseenCount } = useWebSocket();

  if (unseenCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-6 right-6"
      >
        <Button
          className="relative bg-primary hover:bg-primary/90 text-white p-4 h-auto w-auto rounded-full shadow-lg"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-[#FFD166] text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
