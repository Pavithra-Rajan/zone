import { Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  priority: 1 | 2 | 3;
  startTime?: string;
}

interface TaskCardProps {
  task: Task;
  onHover: (taskId: string | null) => void;
  isHovered: boolean;
  index?: number;
}

const priorityLabels = {
  1: "P1",
  2: "P2",
  3: "P3",
};

// Dual color theme palettes for each task index
const colorPalettes = [
  { bg: "bg-blue-950/40", border: "border-blue-700/50", accent: "bg-blue-900/60" },
  { bg: "bg-purple-950/40", border: "border-purple-700/50", accent: "bg-purple-900/60" },
  { bg: "bg-pink-950/40", border: "border-pink-700/50", accent: "bg-pink-900/60" },
  { bg: "bg-indigo-950/40", border: "border-indigo-700/50", accent: "bg-indigo-900/60" },
  { bg: "bg-cyan-950/40", border: "border-cyan-700/50", accent: "bg-cyan-900/60" },
  { bg: "bg-emerald-950/40", border: "border-emerald-700/50", accent: "bg-emerald-900/60" },
  { bg: "bg-amber-950/40", border: "border-amber-700/50", accent: "bg-amber-900/60" },
  { bg: "bg-rose-950/40", border: "border-rose-700/50", accent: "bg-rose-900/60" },
];

export function TaskCard({ task, onHover, isHovered, index = 0 }: TaskCardProps) {
  const palette = colorPalettes[index % colorPalettes.length];
  return (
    <div
      className={cn(
        "glass-card p-4 cursor-pointer transition-all duration-200 group border",
        palette.bg,
        palette.border,
        isHovered && "glass-card-glow scale-[1.02]"
      )}
      onMouseEnter={() => onHover(task.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-md border",
                task.priority === 1 && "priority-p1",
                task.priority === 2 && "priority-p2",
                task.priority === 3 && "priority-p3"
              )}
            >
              {priorityLabels[task.priority]}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.duration}m
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-foreground truncate">{task.title}</h3>
          
          {task.startTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled: {task.startTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
