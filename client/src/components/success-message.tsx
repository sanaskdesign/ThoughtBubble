import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SuccessMessageProps {
  recipientName: string;
  onClose: () => void;
}

export default function SuccessMessage({ recipientName, onClose }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background bg-opacity-70 flex justify-center items-center z-20"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white p-8 rounded-3xl shadow-lg max-w-sm text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Thought Sent!</h3>
        <p className="text-muted-foreground mb-6">
          Your thought has been delivered to {recipientName}!
        </p>
        <Button 
          onClick={onClose}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6"
        >
          Send Another
        </Button>
      </motion.div>
    </motion.div>
  );
}
