# Technical Explanation

## **Agent Workflow**

This is a calendar task optimizer that transforms raw, unstructured task ideas into a time-optimized daily calendar. The system uses Google's Gemini AI to intelligently parse goals and schedule them into today's calendar windows. By combining **LLM reasoning** with **real Google Calendar context**, this system behaves like a lightweight planning agent—turning human intent into a practical, conflict-free daily schedule.

<img width="10285" height="7515" alt="sequence_diagram" src="https://github.com/user-attachments/assets/7d792bdf-a7c1-4466-821d-3a0228992449" />

| Layer | Responsibility | Key Components |
|-----|---------------|----------------|
| Frontend | User input, animations, visualization | React, Vite, Tailwind CSS |
| Backend API | Orchestration & business logic | FastAPI (`executor.py`) |
| Planning Layer | Task parsing & scheduling logic | `planner.py` |
| LLM Interface | Structured Gemini calls | `llm.py` |
| Persistence | Append-only audit trail | `memory.py` |
| External Services | Calendar context | Google Calendar API (OAuth) |

---

### **1. Frontend Initiation (React Component)**

### User Interaction
- User opens the application
- Enters tasks/goals into **Brain Dump Input**
- Submits via **Cmd + Enter** or **Optimize My Day**
---

## **2. Backend: Parse Phase (`/api/parse`)**

```http
POST /api/parse
{
  "text": "Call mom at 1pm, gym for 1 hour, finish report",
  "date_iso": "2025-12-12"
}
```

### Responsibilities
- Extract individual tasks
- Assign priorities (P1 / P2 / P3)
- Infer missing durations
- Detect fixed-time constraints
- Return schema-valid JSON
The user provided input is
```
I want to study for DAA final exam, wrap up cloud computing final project, call mom, hit gym for 30 minutes, read for 30 minutes, meal prep, watch stranger things finale which is 110 minutes at 6 PM.
```
```json
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 120,
    "fixed_time_iso": null,
    "id": "t1",
    "priority": "P2",
    "title": "Study for DAA final exam"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 120,
    "fixed_time_iso": null,
    "id": "t2",
    "priority": "P2",
    "title": "Wrap up cloud computing final project"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 15,
    "fixed_time_iso": null,
    "id": "t3",
    "priority": "P2",
    "title": "Call mom"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 30,
    "fixed_time_iso": null,
    "id": "t4",
    "priority": "P2",
    "title": "Hit gym"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 30,
    "fixed_time_iso": null,
    "id": "t5",
    "priority": "P2",
    "title": "Read"
  },
  {
    "constraint_type": "null",
    "estimated_duration_minutes": 60,
    "fixed_time_iso": null,
    "id": "t6",
    "priority": "P2",
    "title": "Meal prep"
  },
  {
    "constraint_type": "fixed",
    "estimated_duration_minutes": 110,
    "fixed_time_iso": "2025-12-12T18:00:00",
    "id": "t7",
    "priority": "P2",
    "title": "Watch Stranger Things finale"
  }

```
---

## **3. Google Calendar Integration (OAuth & Context Enrichment)**

### Why Google Calendar Context Is Needed
User calendars often already contain:
- Meetings
- Classes
- Appointments
- Travel blocks

Without this context, an optimizer risks **double-booking** tasks.  
To prevent this, the system integrates directly with **Google Calendar**.

---

### How Google Calendar OAuth Works?

1. **User Authorization**
   - User signs in with Google the first time when they attempt to sync the suggested schedule to their Google Calendat
   - Grants read-only calendar access

2. **OAuth Token Exchange**
   - Google issues an access token
   - Token is securely stored server-side

3. **Calendar API Access**
   - Backend calls Google Calendar API

4. **Event Retrieval**
   - Events for the selected day are fetched
   - Each event includes:
     - `summary`
     - `start_iso`
     - `end_iso`
     - `description` (optional)

---

### When Calendar Events Are Fetched
- **After task parsing**  
- **Before schedule optimization**

This ordering is intentional:
- Parsing needs only raw user intent
- Optimization needs **both tasks and real-world constraints**

---

### How Calendar Data Is Used by the Optimizer

| Step | Description |
|---|---|
| 1 | Existing calendar events are converted into **busy time blocks** |
| 2 | Free time windows are derived implicitly |
| 3 | Calendar events are injected into the **Gemini optimize prompt** |
| 4 | Gemini is instructed to schedule tasks **around these events** |

This ensures:
- No overlaps with meetings
- Tasks fit naturally between commitments
- The final schedule reflects the user’s real availability

---

## **4. Backend: Optimize Phase (`/api/optimize`)**

### Optimization Rules
- Respect existing Google Calendar events
- Schedule only within free windows
- Prioritize tasks: P1, P2, P3
- Insert 10-minute breaks when possible
- Skip low-priority tasks if time runs out

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
    "end_iso": "2025-12-12T19:55:00",
    "event_type": "task",
    "start_iso": "2025-12-12T18:05:00",
    "summary": "Watch Stranger Things finale"
  }
}
```
## **5. Data Persistence**

- Append-only `memories.jsonl`
- Stores:
  - Parsed tasks
  - Retrieved calendar events
  - Optimized schedules
- Provides a complete audit trail for observability and debugging

---

## **Known Limitations**

| Area | Limitation |
|------|------------|
| Performance | ~10s parse, ~30s optimize calls|
| Security | No prompt-injection guardrails |
| Assumptions | Trusts user input |
| Scaling | Single-user focused |

---

