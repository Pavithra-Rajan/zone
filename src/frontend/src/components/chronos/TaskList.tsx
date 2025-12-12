import { ListTodo } from "lucide-react";
import { TaskCard, Task } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  hoveredTaskId: string | null;
  onTaskHover: (taskId: string | null) => void;
}

export function TaskList({ tasks, hoveredTaskId, onTaskHover }: TaskListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2 mb-4">
        <ListTodo className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium text-foreground">Parsed Tasks</h2>
        <span className="text-sm text-muted-foreground">({tasks.length})</span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            className="animate-slide-in-right"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <TaskCard
              task={task}
              onHover={onTaskHover}
              isHovered={hoveredTaskId === task.id}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
