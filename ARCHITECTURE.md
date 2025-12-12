## 2. `ARCHITECTURE.md`
### Architecture Diagram
<img width="8299" height="3040" alt="image" src="https://github.com/user-attachments/assets/a1e2f23c-4aed-4ff7-acfc-800d88a8b11f" />

### User Interface
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Integration with Google Calendar

### Agent Core
   - **Planner**: how you break down tasks  
   - **Executor**: LLM prompt + tool-calling logic  
   - **Memory**: vector store, cache, or on-disk logs  

### Tools/API
- Google Gemini API Flash 2.5 model
- Google Calendar API for fetching existing calendar events for the day and inserting the suggested plan for the day

### Observability
- Logging of each reasoning step  
- Error handling / retries  

