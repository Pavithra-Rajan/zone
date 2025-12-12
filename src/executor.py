import os
import json
import typing_extensions as typing
import google.generativeai as genai
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())
logger.addHandler(logging.FileHandler("executor.log"))

# NOTE: API key is stored here in the repo for convenience in this example.
# In production, load from env vars or a secrets manager.
GENAI_API_KEY = os.environ.get("GENAI_API_KEY", "")
genai.configure(api_key=GENAI_API_KEY)

# Lightweight FastAPI server to expose the executor to the frontend.
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import datetime


class Task(typing.TypedDict):
    id: str
    title: str
    priority: str  # "P1", "P2", "P3"
    estimated_duration_minutes: int
    constraint_type: str  # "fixed" or "flexible"
    fixed_time_iso: str | None  # e.g., "2023-10-27T12:00:00" or null

class ScheduleEvent(typing.TypedDict):
    summary: str
    start_iso: str
    end_iso: str
    description: str
    event_type: str # "task", "break", "buffer"

class GeminiExecutor:
    def __init__(self, model_name="gemini-2.5-flash"):
        """
        Initializes the Gemini model wrapper.
        Using 1.5-Flash is recommended for speed/cost on high-frequency tasks,
        but 1.5-Pro is better for complex reasoning.
        """
        self.model_name = model_name
        
    def _get_json_model(self, system_instruction: str):
        """
        Helper to configure the model for JSON output mode.
        """
        return genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2, # Low temp for deterministic logic
            }
        )

    def parse_goals_to_tasks(self, user_input: str, current_date_iso: str) -> list[Task]:
        """
        Agent 1: The Task Extractor
        Converts raw text into a structured list of tasks with priorities.
        """
        system_prompt = f"""
        You are a task parser. Extract tasks from user input.
        Date: {current_date_iso}
        Priority: P1=urgent, P2=standard, P3=low
        Duration: estimate if missing (call=15m, gym=60m, meeting=30m, work=120m)
        Constraints: if user says "at 1pm", mark constraint_type="fixed" and set fixed_time_iso
        IDs: short unique strings (t1, t2, etc)
        Split tasks >2 hours into 1-hour blocks with 15min breaks.
        Be concise. Output only valid JSON.
        """
        
        model = self._get_json_model(system_prompt)
        
        response = model.generate_content(
            f"User Goal Description: {user_input}",
            generation_config=genai.GenerationConfig(response_schema=list[Task])
        )
        
        try:
            logger.debug(f"Parser Response: {response.text}")
            return json.loads(response.text)
        except json.JSONDecodeError:
            logger.error("Error: Gemini failed to produce valid JSON.")
            return []

    def optimize_schedule(self, tasks: list[Task], free_windows: list[dict]) -> list[ScheduleEvent]:
        """
        Agent 2: The Scheduler
        Fits the parsed tasks into the provided free time windows (bin packing).
        """
        system_prompt = """
        Schedule tasks into free windows. Output JSON list of events.
        Priority: P1 first, then P2, then P3.
        Rules:
        - Don't exceed window duration
        - Add 10min break between tasks if space allows
        - Insert breaks explicitly as event_type='break'
        - Use exact ISO start/end times
        - Skip P3 if no time
        Be concise. Output only valid JSON.
        """

        model = self._get_json_model(system_prompt)
        
        # Construct a payload describing the state
        prompt_payload = json.dumps({
            "tasks_to_schedule": tasks,
            "available_time_windows": free_windows
        }, indent=2)

        response = model.generate_content(
            f"Optimize this schedule:\n{prompt_payload}",
            generation_config=genai.GenerationConfig(response_schema=list[ScheduleEvent])
        )
        logger.debug(f"Optimised schedule JSON {response.text}")

        return json.loads(response.text)

class ParseRequest(BaseModel):
    text: str
    date_iso: Optional[str] = None


class OptimizeRequest(BaseModel):
    tasks: List[dict]
    free_windows: Optional[List[dict]] = None




app = FastAPI()

# Allow the Vite dev server and other origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/parse")
def parse_brain_dump(req: ParseRequest):
    exe = GeminiExecutor()
    date_iso = req.date_iso or (os.environ.get("CURRENT_DATE") or None)
    try:
        tasks = exe.parse_goals_to_tasks(req.text, date_iso or "")
        return {"tasks": tasks}
    except Exception as e:
        logger.exception("Error while parsing brain dump")
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/optimize")
def optimize_schedule(req: OptimizeRequest):
    exe = GeminiExecutor()
    try:
        free_windows = req.free_windows
        if not free_windows:
            # create a default free window for today from 09:00 to 18:00
            date_iso = os.environ.get("CURRENT_DATE") or datetime.date.today().isoformat()
            free_windows = [{
                "start": f"{date_iso}T09:00:00",
                "end": f"{date_iso}T18:00:00"
            }]

        logger.debug("Optimize request: tasks=%s free_windows=%s", req.tasks, free_windows)
        schedule = exe.optimize_schedule(req.tasks, free_windows)
        logger.debug("Optimize response: %s", schedule)
        return {"events": schedule}
    except Exception as e:
        logger.exception("Error while optimizing schedule")
        raise HTTPException(status_code=500, detail=str(e))
