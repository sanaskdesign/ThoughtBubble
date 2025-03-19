import { useState } from "react";
import { User, MessagePayload } from "@shared/schema";
import { useWebSocket } from "@/lib/websocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send as SendIcon, Smile as SmileIcon, MessageCircle as MessageCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { emojis, EmojiCategory } from "../lib/emojis";

interface MessageComposerProps {
  selectedRecipient: User | null;
  onSending: () => void;
  onSent: (recipient: User) => void;
}

const emojiCategories = [
  { id: "smileys", name: "Smileys", icon: <SmileIcon className="h-4 w-4" /> },
  { id: "love", name: "Love", icon: "❤️" },
  { id: "food", name: "Food", icon: "🍰" },
  { id: "animals", name: "Animals", icon: "🐱" },
  { id: "activities", name: "Activities", icon: "🎮" },
];

export default function MessageComposer({ selectedRecipient, onSending, onSent }: MessageComposerProps) {
  const [activeTab, setActiveTab] = useState<"emoticon" | "thought">("emoticon");
  const [activeCategory, setActiveCategory] = useState<string>("smileys");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [thoughtText, setThoughtText] = useState<string>("");
  const { sendMessage } = useWebSocket();
  const { toast } = useToast();

  const handleSend = () => {
    if (!selectedRecipient) {
      toast({
        title: "No recipient selected",
        description: "Please select someone to send your thought to",
        variant: "destructive",
      });
      return;
    }

    let content = "";
    let type: "emoticon" | "thought" = "emoticon";

    if (activeTab === "emoticon") {
      if (!selectedEmoji) {
        toast({
          title: "No emoticon selected",
          description: "Please select an emoticon to send",
          variant: "destructive",
        });
        return;
      }
      content = selectedEmoji;
    } else {
      if (!thoughtText.trim()) {
        toast({
          title: "Empty thought",
          description: "Please enter a message to send",
          variant: "destructive",
        });
        return;
      }
      content = thoughtText;
      type = "thought";
    }

    const payload: MessagePayload = {
      recipientId: selectedRecipient.id,
      type,
      content,
    };

    onSending();
    
    sendMessage(payload);
    
    // Reset form
    setSelectedEmoji("");
    setThoughtText("");
    
    // Notify parent
    onSent(selectedRecipient);
  };

  return (
    <Card className="mb-6 shadow-lg rounded-3xl">
      <CardContent className="p-6">
        {selectedRecipient ? (
          <>
            <div className="flex items-center mb-6">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={selectedRecipient.avatar || undefined} alt={selectedRecipient.username} />
                <AvatarFallback>{selectedRecipient.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-bold text-lg text-foreground">{selectedRecipient.username}</p>
                <p className="text-sm text-muted-foreground">@{selectedRecipient.username.toLowerCase()}</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "emoticon" | "thought")} className="w-full">
              <TabsList className="w-full mb-5 border-b">
                <TabsTrigger value="emoticon" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <SmileIcon className="h-4 w-4 mr-2" /> Emoticon
                </TabsTrigger>
                <TabsTrigger value="thought" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <MessageCircleIcon className="h-4 w-4 mr-2" /> Thought Bubble
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="emoticon">
                <div className="emoticon-selector mb-6">
                  <div className="emoji-categories flex space-x-2 mb-4 overflow-x-auto pb-2">
                    {emojiCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        className={`
                          rounded-full whitespace-nowrap flex items-center
                          ${activeCategory === category.id ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary hover:text-white'}
                        `}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <span className="mr-1">{category.icon}</span> {category.name}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {emojis[activeCategory as EmojiCategory].map((emoji: string) => (
                      <button
                        key={emoji}
                        className={`
                          w-12 h-12 flex justify-center items-center text-2xl 
                          rounded-xl transition-colors hover:bg-secondary
                          ${selectedEmoji === emoji ? 'bg-secondary' : 'bg-muted bg-opacity-50'}
                        `}
                        onClick={() => setSelectedEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="thought">
                <div className="thought-bubble-composer">
                  <Textarea
                    value={thoughtText}
                    onChange={(e) => setThoughtText(e.target.value)}
                    placeholder="Type your thoughts here..."
                    className="min-h-[100px] mb-4 border-2 border-neutral focus:border-primary transition-colors"
                    maxLength={100}
                  />
                  
                  <div className="flex items-center justify-end mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span>{thoughtText.length}</span>/100
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <SmileIcon className="h-12 w-12 mx-auto mb-3 text-muted" />
            <p>Select a recipient to send a thought to</p>
          </div>
        )}
        
        <Button
          onClick={handleSend}
          disabled={!selectedRecipient}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-foreground font-bold py-3 px-4"
        >
          <span className="mr-2">Send Thought</span>
          <SendIcon className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
