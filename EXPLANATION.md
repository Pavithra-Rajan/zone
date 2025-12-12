# Technical Explanation

## **Agent Workflow**

This is a calendar task optimizer that transforms raw, unstructured task ideas into a time-optimized daily calendar. The system uses Google's Gemini AI to intelligently parse goals and schedule them into today's calendar windows.

---

### **1. Frontend Initiation (React Component)**

**User Action:**
- User opens the application and views the main page
- They type tasks/goals into the **Brain Dump Input** textarea (e.g., "Call mom at 1pm, gym for 1 hour, finish report")
- They press `Cmd + Enter` or click "Optimize My Day" button

**Component Triggered:**
- `BrainDumpInput` component captures the text and calls `onSubmit(text)`
- This triggers the `simulateProcessing()` function in the `Index.tsx` page

---

### **2. Frontend Processing (Step-by-Step Animation)**

**What happens:**
1. The UI shows a "processing steps" animation with 7 steps:
   - "Fetching existing calendar events..."
   - "Parsing your brain dump..."
   - "Identifying tasks and priorities..."
   - ...and so on
   
2. **Concurrently** (while animation runs), it makes the first API call to the backend

---

### **3. Backend: Parse Phase (`/api/parse` endpoint)**

**Frontend HTTP Request:**
```
POST http://localhost:8000/api/parse
{
  "text": "Call mom at 1pm, gym for 1 hour, finish report",
  "date_iso": "2025-12-12"
}
```

## **Key modules (in `executor.py`):**

1. **`/api/parse` endpoint receives request**: extracts `text` and `date_iso`

2. **Calls `parse_goals_to_tasks(text, date_iso)`** (from `planner.py`)
   
3. **Inside `planner.py`:**
   - Creates a `GeminiExecutor` instance (from `llm.py`)
   - Builds a system prompt that tells Gemini to:
     - Extract individual tasks from the brain dump
     - Assign priority levels (P1/P2/P3)
     - Estimate durations if missing
     - Identify fixed time constraints (e.g., "at 1pm")
     - Return structured JSON as a `list[Task]`
   
4. **Calls `GeminiExecutor.generate_json()`** (from `llm.py`)
   - Configures Gemini 2.5-Flash model with:
     - `response_mime_type: "application/json"` (forces JSON output)
     - `response_schema: list[Task]` (validates structure)
     - `temperature: 0.2` (deterministic, low randomness)
   - Sends system prompt + user brain dump to Gemini API
   - Returns Gemini's JSON response

5. **Parses JSON response** : converts to Python list of dicts
   
6. **Logs to memory** (via `memory.py`):
   - Appends `{"type": "parse", "input": text, "tasks": tasks}` to `memories.jsonl` file

7. **Returns tasks to frontend**

**Example Output:**
```json
{
  "tasks": [
    {
    "constraint_type": "null",
    "estimated_duration_minutes": 120,
    "fixed_time_iso": "null",
    "id": "t1",
    "priority": "P2",
    "title": "Study for DAA final exam"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 120,
    "fixed_time_iso": "null",
    "id": "t2",
    "priority": "P2",
    "title": "Wrap up cloud project"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 15,
    "fixed_time_iso": "null",
    "id": "t3",
    "priority": "P2",
    "title": "Call mom"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 60,
    "fixed_time_iso": "null",
    "id": "t4",
    "priority": "P2",
    "title": "Hit the gym"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 60,
    "fixed_time_iso": "null",
    "id": "t5",
    "priority": "P2",
    "title": "Do meal prep"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 110,
    "fixed_time_iso": "null",
    "id": "t6",
    "priority": "P2",
    "title": "Watch Stranger Things finale"
  }
   ]
}
```

---

### **4. Frontend: Display Parsed Tasks**

**Frontend receives response and:**

1. **Maps backend Task objects to frontend Task interface:**
   - Extracts: `id`, `title`, `duration`, `priority` (1/2/3 based on P1/P2/P3)
   - Stores in `tasks` state

2. **Displays in `TaskList` component:**
   - Shows each task as a colored `TaskCard`
   - Uses **8-color palette rotation** (blue, purple, pink, indigo, cyan, emerald, amber, rose)
   - Color index cycles: `palette[taskIndex % 8]`

3. **Updates `proposedEvents` for tasks with fixed times:**
   - Converts `fixed_time_iso` to decimal hours for timeline positioning
   - Example: "13:00" (1 PM) sets `startHour: 13.0`

---

### **5. Backend: Optimize Phase (`/api/optimize` endpoint)**

**After showing parsed tasks, frontend calls the optimize endpoint:**
```
POST http://localhost:8000/api/optimize
{
  "tasks": [the parsed tasks array],
  "free_windows": null
}
```

## Key Modules 
### **Backend Flow (in `executor.py`):**

1. **`/api/optimize` endpoint receives request**: extracts parsed `tasks`

2. **Calls `optimize_schedule(tasks, free_windows)`** (from `planner.py`)

3. **Inside `planner.py`:**
   - Creates another `GeminiExecutor` instance
   - Builds a system prompt telling Gemini to:
     - Schedule all tasks into today's available time windows
     - Prioritize P1 tasks first, then P2, then P3
     - Add 10-minute breaks between tasks if space allows
     - Return structured JSON as `list[ScheduleEvent]`
     - Skip low-priority tasks if no time available
   
4. **Calls `GeminiExecutor.generate_json()`:**
   - Similar setup to parse phase (JSON mode, schema validation, low temperature)
   - Sends tasks + available windows to Gemini
   - Gemini returns scheduled times for each task

5. **Parses JSON response**: converts to Python list of ScheduleEvent dicts

6. **Logs to memory:**
   - Appends `{"type": "optimize", "tasks": input_tasks, "events": scheduled_events}` to `memories.jsonl`

7. **Returns scheduled events to frontend**

**Example Output:**
```json
{
  "events":   {
    "description": "Study for DAA final exam",
    "end_iso": "2025-12-12T11:00:00",
    "event_type": "task",
    "start_iso": "2025-12-12T09:00:00",
    "summary": "Study for DAA final exam"
  },
  {
    "description": "10 minute break",
    "end_iso": "2025-12-12T11:10:00",
    "event_type": "break",
    "start_iso": "2025-12-12T11:00:00",
    "summary": "Break"
  },
  {
    "description": "Wrap up cloud project",
    "end_iso": "2025-12-12T13:10:00",
    "event_type": "task",
    "start_iso": "2025-12-12T11:10:00",
    "summary": "Wrap up cloud project"
  },
  {
    "description": "10 minute break",
    "end_iso": "2025-12-12T13:20:00",
    "event_type": "break",
    "start_iso": "2025-12-12T13:10:00",
    "summary": "Break"
  },
  {
    "description": "Call mom",
    "end_iso": "2025-12-12T13:35:00",
    "event_type": "task",
    "start_iso": "2025-12-12T13:20:00",
    "summary": "Call mom"
  },
  {
    "description": "10 minute break",
    "end_iso": "2025-12-12T13:45:00",
    "event_type": "break",
    "start_iso": "2025-12-12T13:35:00",
    "summary": "Break"
  },
  {
    "description": "Hit the gym",
    "end_iso": "2025-12-12T14:45:00",
    "event_type": "task",
    "start_iso": "2025-12-12T13:45:00",
    "summary": "Hit the gym"
  },
  {
    "description": "10 minute break",
    "end_iso": "2025-12-12T14:55:00",
    "event_type": "break",
    "start_iso": "2025-12-12T14:45:00",
    "summary": "Break"
  },
  {
    "description": "Meal prep",
    "end_iso": "2025-12-12T15:55:00",
    "event_type": "task",
    "start_iso": "2025-12-12T14:55:00",
    "summary": "Meal prep"
  },
  {
    "description": "10 minute break",
    "end_iso": "2025-12-12T16:05:00",
    "event_type": "break",
    "start_iso": "2025-12-12T15:55:00",
    "summary": "Break"
  },
  {
    "description": "Watch Stranger Things finale",
    "end_iso": "2025-12-12T17:55:00",
    "event_type": "task",
    "start_iso": "2025-12-12T16:05:00",
    "summary": "Watch Stranger Things finale"
  }
}
```

---

### **6. Frontend: Display Optimized Schedule**

**Frontend receives optimize response and:**

1. **Maps ScheduleEvent objects to TimelineEvent objects:**
   - Filters for `event_type === "task"` (hides breaks)
   - Converts ISO timestamps to decimal hours:
     - `"2025-12-12T14:00:00"` → `startHour: 14.0`
     - `"2025-12-12T16:00:00"` → duration spans 2 hours → `duration: 2.0`

2. **Updates task start times:**
   - Matches tasks in `TaskList` by title
   - Adds `startTime` property to tasks if they got scheduled

3. **Updates `proposedEvents` in Timeline:**
   - Replaces placeholder proposed events with actual optimized schedule

---

### **7. Frontend: Timeline Visualization**

**`Timeline` component renders the visual schedule:**

1. **Time Grid (8 AM - 8 PM):**
   - Shows 13 rows, one per hour
   - Each row labeled with hour (08:00, 09:00, ..., 20:00)
   - Each row is 64px tall

2. **Event Positioning:**
   - Each event positioned absolutely within the timeline
   - `top = (startHour - 8) * 64` (offset from 8 AM baseline)
   - `height = duration * 64` (1 hour = 64px)

3. **Time Formatting:**
   - Function `formatTime(decimalHour)` converts decimals to HH:MM
   - Example: `14.25` (2:15 PM) → `"14:15"`
   - Prevents NaN by properly calculating hours and minutes

4. **Event Rendering:**
   - Each event is a colored box with:
     - Title (task name)
     - Time range (e.g., "14:00 - 16:00")
     - CSS class distinguishing type: `event-existing` or `event-proposed`

5. **Loading State:**
   - If `isProcessing === true`, shows spinning calendar icon + "Loading your optimized schedule..."
   - Prevents showing NaN values during API calls

---

### **8. Data Persistence (Memory Module)**

**Throughout the process, `memory.py` logs entries:**

- Appends to `memories.jsonl` (append-only format)
- Each line is a JSON object with timestamp, operation type, inputs, and outputs
- Serves as an audit trail for:
  - What user submitted
  - What tasks were parsed
  - What schedule was generated
  - Can be used for future refinement or analytics

---

### **Data Flow Diagram**

```
User Types Brain Dump
         ↓
[Frontend: BrainDumpInput captures text]
         ↓
POST /api/parse {text, date_iso}
         ↓
[Backend: Gemini parses text into structured Task objects]
         ↓
Response: {tasks: [Task, Task, Task]}
         ↓
[Frontend: Maps tasks, displays TaskList with colors, logs to memory]
         ↓
[UI shows processing animation while next call happens]
         ↓
POST /api/optimize {tasks}
         ↓
[Backend: Gemini schedules tasks into time windows]
         ↓
Response: {events: [ScheduleEvent, ScheduleEvent, ...]}
         ↓
[Frontend: Maps to TimelineEvent, positions on calendar grid]
         ↓
[Timeline renders visual schedule with formatted times 14:00-16:00]
         ↓
[Memory module logs all inputs/outputs to memories.jsonl]
```

---

### **Key Design Patterns**

**1. Modular Separation:**
- `llm.py`: Gemini API instance
- `planner.py`: Business logic (knows task/schedule concepts)
- `memory.py`: Persistence (append-only audit trail)
- `executor.py`: HTTP server (orchestrates the above)

**2. Concurrent Processing:**
- Frontend shows animation while backend API calls execute
- Prevents UI blocking on network latency

**3. Type Safety:**
- TypedDict schemas (`Task`, `ScheduleEvent`) define contracts between frontend/backend
- Gemini enforces JSON schema validation
- Frontend maps responses to typed interfaces

**4. JSON-First Communication:**
- All backend responses are structured JSON
- Frontend safely parses and transforms for UI display  


## Observability & Testing

The logs have been saved in `src/executor.log`. 

## Known Limitations

Be honest about edge cases or performance bottlenecks:
- Gemini API call to optimize takes about ~10 seconds for parse endpoint and ~30 seconds for optimization and forming the timeline.
- Not accounted for prompt injection and have not added guard rails to protect it. We presume that the user will be kind.

