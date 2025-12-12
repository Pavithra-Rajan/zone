import { useState } from "react";
import { ChevronDown, Terminal, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentStatusProps {
  isProcessing: boolean;
  steps: string[];
  currentStep: number;
}

export function AgentStatus({ isProcessing, steps, currentStep }: AgentStatusProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isProcessing && steps.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden animate-scale-in" style={{ animationDelay: "0.2s" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Thought Process</span>
          {isProcessing && (
            <span className="flex items-center gap-1 text-xs text-primary animate-typing">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Processing
            </span>
          )}
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm font-mono transition-all duration-300",
                index < currentStep && "text-success",
                index === currentStep && "text-foreground animate-typing",
                index > currentStep && "text-muted-foreground/50"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : index === currentStep ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
