import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function SendingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background bg-opacity-70 flex justify-center items-center z-20"
    >
      <motion.div 
        className="relative bg-white p-10 rounded-3xl shadow-lg max-w-xs flex flex-col items-center"
        style={{
          borderRadius: "30px",
          position: "relative",
        }}
      >
        <motion.div 
          className="text-6xl mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          😊
        </motion.div>
        <p className="text-foreground text-center mb-4 font-medium">Sending your thought...</p>
        <Progress className="w-full h-2" value={75} />
        
        <motion.div
          className="absolute -bottom-6 right-5 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute -bottom-12 right-2 w-3 h-3 bg-white rounded-full shadow-md"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
