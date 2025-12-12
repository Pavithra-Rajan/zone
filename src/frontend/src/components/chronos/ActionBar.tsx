import { CalendarCheck2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onSync: () => void;
  onRefine: () => void;
  visible: boolean;
}

export function ActionBar({ onSync, onRefine, visible }: ActionBarProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="glass-card-glow flex items-center gap-3 p-3">
        <Button variant="glass" onClick={onRefine} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refine
        </Button>
        <Button variant="success" size="lg" onClick={onSync} className="gap-2">
          <CalendarCheck2 className="h-4 w-4" />
          Sync to Google Calendar
        </Button>
      </div>
    </div>
  );
}
