import { useState, useEffect } from "react";
import { Header } from "@/components/chronos/Header";
import { BrainDumpInput } from "@/components/chronos/BrainDumpInput";
import { AgentStatus } from "@/components/chronos/AgentStatus";
import { TaskList } from "@/components/chronos/TaskList";
import { Timeline } from "@/components/chronos/Timeline";
import { ActionBar } from "@/components/chronos/ActionBar";
import { Task } from "@/components/chronos/TaskCard";
import { toast } from "sonner";

const processingSteps = [
  "Fetching existing calendar events...",
  "Parsing your brain dump...",
  "Identifying tasks and priorities...",
  "Estimating durations...",
  "Optimizing schedule...",
  "Resolving conflicts...",
  "Finalizing your day...",
];

type TimelineEvent = {
  id: string;
  title: string;
  startHour: number;
  duration: number;
  type: "existing" | "proposed";
};

const existingEvents: TimelineEvent[] = [
  { id: "1", title: "Team Standup", startHour: 9, duration: 0.5, type: "existing" },
  { id: "2", title: "Lunch Break", startHour: 12, duration: 1, type: "existing" },
  { id: "3", title: "Client Call", startHour: 15, duration: 1, type: "existing" },
];

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [proposedEvents, setProposedEvents] = useState<TimelineEvent[]>([]);

  const simulateProcessing = async (text: string) => {
    setIsProcessing(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setTasks([]);
    setProposedEvents([]);

    // Simulate step-by-step processing
    for (let i = 0; i < processingSteps.length; i++) {
      setCompletedSteps(prev => [...prev, processingSteps[i]]);
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    }

    // Generate mock tasks from the input
    const mockTasks: Task[] = [
      { id: "t1", title: "Deep work session - Project Alpha", duration: 90, priority: 1, startTime: "10:00" },
      { id: "t2", title: "Review design mockups", duration: 45, priority: 2, startTime: "13:30" },
      { id: "t3", title: "Email follow-ups", duration: 30, priority: 3, startTime: "14:15" },
      { id: "t4", title: "Strategic planning", duration: 60, priority: 1, startTime: "16:30" },
      { id: "t5", title: "End-of-day review", duration: 15, priority: 3, startTime: "18:00" },
    ];

    const mockProposed = [
      { id: "p1", title: "Deep Work: Project Alpha", startHour: 10, duration: 1.5, type: "proposed" as const },
      { id: "p2", title: "Review Design Mockups", startHour: 13.5, duration: 0.75, type: "proposed" as const },
      { id: "p3", title: "Email Follow-ups", startHour: 14.25, duration: 0.5, type: "proposed" as const },
      { id: "p4", title: "Strategic Planning", startHour: 16.5, duration: 1, type: "proposed" as const },
      { id: "p5", title: "End-of-Day Review", startHour: 18, duration: 0.25, type: "proposed" as const },
    ];

    setCurrentStep(processingSteps.length);
    setTasks(mockTasks);
    setProposedEvents(mockProposed);
    setIsProcessing(false);

    toast.success("Schedule optimized!", {
      description: `Found ${mockTasks.length} tasks and scheduled them around your existing events.`,
    });
  };

  const handleSync = () => {
    toast.success("Synced to Google Calendar!", {
      description: "Your optimized schedule has been added to your calendar.",
    });
  };

  const handleRefine = () => {
    toast.info("Opening refinement mode...", {
      description: "Drag tasks to reorder or adjust times.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input & Tasks */}
          <div className="space-y-6">
            <BrainDumpInput 
              onSubmit={simulateProcessing} 
              isProcessing={isProcessing} 
            />
            
            <AgentStatus 
              isProcessing={isProcessing} 
              steps={completedSteps}
              currentStep={currentStep}
            />
            
            <TaskList 
              tasks={tasks}
              hoveredTaskId={hoveredTaskId}
              onTaskHover={setHoveredTaskId}
            />
          </div>
          
          {/* Right Column - Timeline */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <Timeline 
              events={[...existingEvents, ...proposedEvents]}
              proposedTasks={tasks}
              hoveredTaskId={hoveredTaskId}
            />
          </div>
        </div>
        
        <ActionBar 
          visible={tasks.length > 0 && !isProcessing}
          onSync={handleSync}
          onRefine={handleRefine}
        />
      </div>
    </div>
  );
};

export default Index;
