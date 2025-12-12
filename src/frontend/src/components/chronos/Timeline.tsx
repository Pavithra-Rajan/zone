import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskCard";

interface TimelineEvent {
  id: string;
  title: string;
  startHour: number;
  duration: number; // in hours
  type: "existing" | "proposed";
}

interface TimelineProps {
  events: TimelineEvent[];
  proposedTasks: Task[];
  hoveredTaskId: string | null;
  isProcessing?: boolean;
}

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

const formatTime = (decimalHour: number): string => {
  const hours = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export function Timeline({ events, proposedTasks, hoveredTaskId, isProcessing = false }: TimelineProps) {
  const getEventPosition = (startHour: number, duration: number) => {
    const top = (startHour - 8) * 64; // 64px per hour
    const height = duration * 64;
    return { top, height };
  };

  const hoveredTask = proposedTasks.find(t => t.id === hoveredTaskId);

  return (
    <div className="glass-card p-6 h-full animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium text-foreground">Today's Schedule</h2>
      </div>

      {isProcessing ? (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Calendar className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-sm">Loading your optimized schedule...</p>
          </div>
        </div>
      ) : (
        <div className="relative">
        {/* Time labels and grid */}
        <div className="space-y-0">
          {hours.map((hour) => (
            <div key={hour} className="timeline-slot flex">
              <span className="w-12 text-xs text-muted-foreground -translate-y-2">
                {hour.toString().padStart(2, "0")}:00
              </span>
              <div className="flex-1 border-l border-border/30" />
            </div>
          ))}
        </div>

        {/* Events overlay */}
        <div className="absolute top-0 left-12 right-0 bottom-0">
          {events.map((event) => {
            const { top, height } = getEventPosition(event.startHour, event.duration);
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute left-2 right-2 rounded-lg px-3 py-2 transition-all duration-200",
                  event.type === "existing" && "event-existing",
                  event.type === "proposed" && "event-proposed"
                )}
                style={{ top, height: Math.max(height - 4, 24) }}
              >
                <span className="text-xs font-medium text-foreground truncate block">
                  {event.title}
                </span>
                <span className="text-xs text-foreground/70">
                  {formatTime(event.startHour)} - {formatTime(event.startHour + event.duration)}
                </span>
              </div>
            );
          })}

          {/* Ghost placement for hovered task */}
          {hoveredTask && (
            <div
              className="absolute left-2 right-2 rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 transition-all duration-200 animate-pulse"
              style={{
                top: 2 * 64, // Default to 10:00
                height: Math.max((hoveredTask.duration / 60) * 64 - 4, 24),
              }}
            >
              <span className="text-xs text-primary p-2 block">
                {hoveredTask.title}
              </span>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
