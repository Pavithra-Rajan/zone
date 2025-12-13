## 2. `ARCHITECTURE.md`
## Architecture Diagram
<img width="8299" height="3040" alt="image" src="https://github.com/user-attachments/assets/a1e2f23c-4aed-4ff7-acfc-800d88a8b11f" />

This document provides a concise, high-level architecture view of the system.  It focuses on components, responsibilities, and interactions, not execution details. Visit the `EXPLANATION.md` document for more details on this. 

---

## 1. User Interface Layer

**Purpose:**  
Collect user intent, visualize plans, and provide real-time feedback during optimization.

### Tech Stack
- **Vite**: fast build tooling and dev server
- **TypeScript**: type safety across UI and API boundaries
- **React**: component-based UI
- **shadcn-ui**: accessible, composable UI primitives
- **Tailwind CSS**: utility-first styling

### Responsibilities
- Brain-dump task input
- Step-by-step processing animation
- Task list visualization
- Timeline-based schedule visualization
- Loading, error, and retry states

---

## 2. Integration with Google Calendar

**Purpose:**  
Ensure schedules are grounded in the user’s real availability.

### Key Capabilities
- OAuth-based authentication with Google
- Read-only access to the user’s calendar
- Fetch existing events for the selected day
- Insert optimized tasks back into the calendar (optional write scope)

### Usage in Flow
- Calendar events are fetched after task parsing
- Existing events are passed as context to the optimizer
- The agent schedules tasks around busy blocks, avoiding conflicts

---

## 3. Agent Core

**Purpose:**  
Act as an intelligent planning agent that converts intent into an executable schedule.

### 3.1 Planner
- Breaks unstructured text into discrete tasks
- Identifies:
  - Task boundaries
  - Priorities (P1 / P2 / P3)
  - Durations
  - Fixed-time constraints
- Produces structured, machine-readable task objects

### 3.2 Executor
- Owns all LLM interactions
- Constructs:
  - System prompts
  - Context payloads (tasks + calendar events)
- Invokes Gemini with:
  - JSON-only outputs
  - Schema validation
- Handles retries, validation failures, and fallbacks

### 3.3 Memory
- Persistent record of agent behavior
- Can be implemented as:
  - Append-only on-disk logs
  - Cache layer
  - Vector store (future extension)

**Stored artifacts:**
- Raw user input
- Parsed tasks
- Retrieved calendar events
- Optimized schedules

---

## 4. Tools & External APIs

### Google Gemini API
- **Model:** Gemini Flash 2.5
- **Role:**
  - Task extraction
  - Priority reasoning
  - Schedule optimization
- **Configuration:**
  - Low temperature for determinism (0.2)
  - Enforced JSON schema output

### Google Calendar API
- Fetches existing events for the day
- Supplies real-world constraints to the planner
- Enables writing optimized plans back to the calendar (optional)

---

## 5. Observability & Reliability

### Logging
- Each agent phase is logged:
  - Parse
  - Calendar fetch
  - Optimize
- Logs include inputs, outputs, and timestamps

### Error Handling
- Graceful handling of:
  - LLM schema violations
  - API timeouts
  - OAuth failures
- Retries with bounded limits
- UI-safe error propagation

---

## 6. Architectural Principles

- **Separation of concerns**  
  UI, planning logic, LLM execution, and persistence are isolated.

- **LLM as a reasoning engine, not state**  
  All state is explicit and auditable.

- **Context-aware planning**  
  Scheduling is always grounded in real calendar data.

- **Deterministic by default**  
  Low randomness, structured outputs, predictable behavior.
