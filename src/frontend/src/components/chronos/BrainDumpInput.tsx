import { useState } from "react";
import { Send, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BrainDumpInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

export function BrainDumpInput({ onSubmit, isProcessing }: BrainDumpInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && !isProcessing) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium text-foreground">Brain Dump</h2>
      </div>
      
      <Textarea
        placeholder="What are your goals for today? Dump everything on your mind..."
        className="min-h-[120px] resize-none bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
      />
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-muted-foreground">⌘ + Enter to optimize</span>
        <Button 
          variant="gradient" 
          size="lg"
          onClick={handleSubmit}
          loading={isProcessing}
          disabled={!text.trim()}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Optimize My Day
        </Button>
      </div>
    </div>
  );
}
