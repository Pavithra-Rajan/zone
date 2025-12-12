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
  "Parsing your brain dump...",
  "Identifying tasks and priorities...",
  "Estimating durations...",
  "Fetching existing calendar events from Google Calendar...",
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

const existingEvents: TimelineEvent[] = [];

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [proposedEvents, setProposedEvents] = useState<TimelineEvent[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<any[]>([]);

  const simulateProcessing = async (text: string) => {
    setIsProcessing(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setTasks([]);
    setProposedEvents([]);

    // Choose API endpoint: during local dev call backend on port 8000.
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const apiEndpoint = isLocalhost ? "http://localhost:8000/api/parse" : "/api/parse";

    // Start the network request early so we can run the UI processing animation concurrently.
    const apiPromise = fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, date_iso: new Date().toISOString().slice(0, 10) }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to parse brain dump");
        return res.json();
      })
      .catch((err) => {
        console.error("/api/parse error:", err);
        toast.error("Failed to contact the scheduling service.");
        return { tasks: [] };
      });

    // Simulate step-by-step processing while the API call runs.
    for (let i = 0; i < processingSteps.length; i++) {
      setCompletedSteps((prev) => [...prev, processingSteps[i]]);
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
    }

    // Await the parsed tasks from the backend
    const result = await apiPromise;
    console.debug("Parse API result:", result);
    const parsed: any[] = (result && result.tasks) || [];

    // Map backend task shape to frontend Task shape
    const mappedTasks: Task[] = parsed.map((t: any, idx: number) => {
      const priorityRaw = (t.priority || "P2").toString().toUpperCase();
      const priority = priorityRaw.includes("1") ? 1 : priorityRaw.includes("2") ? 2 : 3;
      const duration = t.estimated_duration_minutes ?? t.duration ?? 30;
      const startTime = t.fixed_time_iso
        ? new Date(t.fixed_time_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : t.start_time || undefined;

      return {
        id: t.id || `t${idx + 1}`,
        title: t.title || t.summary || `Task ${idx + 1}`,
        duration,
        priority,
        startTime,
      };
    });

    // Build proposed timeline events for tasks that include a fixed start time.
    const mockProposed = parsed
      .filter((t: any) => t.fixed_time_iso)
      .map((t: any, idx: number) => {
        const d = new Date(t.fixed_time_iso);
        const startHour = d.getHours() + d.getMinutes() / 60;
        const duration = (t.estimated_duration_minutes ?? 30) / 60;
        return {
          id: `p${t.id || idx}`,
          title: t.title || t.summary || "Proposed Task",
          startHour,
          duration,
          type: "proposed" as const,
        };
      });

    setCurrentStep(processingSteps.length);
    setTasks(mappedTasks);
    setProposedEvents(mockProposed);
    
    // Call optimize endpoint to place tasks into today's schedule
    try {
      const optimizeEndpoint = isLocalhost ? "http://localhost:8000/api/optimize" : "/api/optimize";
      const optRes = await fetch(optimizeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: parsed }),
      });

      if (optRes.ok) {
        const optJson = await optRes.json();
        console.debug("Optimize API result:", optJson);
        const events: any[] = optJson.events || [];

        // Map schedule events into timeline and update task start times when possible (exclude breaks)
        const scheduledProposed: TimelineEvent[] = events
          .filter((e) => e.event_type === "task")
          .map((e, idx) => {
            const start = new Date(e.start_iso);
            const end = new Date(e.end_iso);
            const startHour = start.getHours() + start.getMinutes() / 60;
            const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return {
              id: e.summary ? `p-${idx}-${e.summary}` : `p-${idx}`,
              title: e.summary,
              startHour,
              duration,
              type: "proposed" as const,
            };
          });

        // Update mappedTasks with scheduled times when possible (match by title substring)
        const updatedTasks = mappedTasks.map((mt) => {
          const match = events.find((ev: any) => {
            if (!ev.summary) return false;
            return ev.summary.toLowerCase().includes((mt.title || "").toLowerCase()) || (mt.title || "").toLowerCase().includes(ev.summary.toLowerCase());
          });
          if (match) {
            const s = new Date(match.start_iso);
            return { ...mt, startTime: s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
          }
          return mt;
        });

        setTasks(updatedTasks);
        if (scheduledProposed.length > 0) setProposedEvents((prev) => [...prev.filter((p) => p.type !== "proposed"), ...scheduledProposed]);
        // Save the raw optimized schedule returned from the backend so we can sync it to Google Calendar
        setScheduledEvents(events);
        if (events.length === 0) {
          toast.warning("No tasks could be scheduled into today's free windows.");
        }
      } else {
        console.error("Optimize request failed", optRes.statusText);
      }
    } catch (err) {
      console.error("/api/optimize error:", err);
      toast.error("Schedule optimization failed.");
    }
    setIsProcessing(false);

    toast.success("Schedule optimized!", {
      description: `Found ${mappedTasks.length} tasks and scheduled them around your existing events.`,
    });
  };

  const handleSync = async () => {
    if (scheduledEvents.length === 0) {
      toast.warning("No scheduled events to sync.", {
        description: "Please run optimization first so there is a schedule to send to Google Calendar.",
      });
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const scheduleEndpoint = isLocalhost
      ? "http://localhost:8000/api/schedule"
      : "/api/schedule";

    try {
      toast.info("Syncing to Google Calendar...", {
        description: "Sending your optimized schedule to the calendar service.",
      });

      const res = await fetch(scheduleEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: scheduledEvents }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("/api/schedule failed:", res.status, text);
        toast.error("Failed to sync to Google Calendar.");
        return;
      }

      const json = await res.json().catch(() => ({}));
      console.debug("Schedule API response:", json);

      toast.success("Synced to Google Calendar!", {
        description: "Your optimized schedule has been added to your calendar.",
      });
    } catch (err) {
      console.error("/api/schedule error:", err);
      toast.error("Schedule sync failed.");
    }
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
              isProcessing={isProcessing}
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
