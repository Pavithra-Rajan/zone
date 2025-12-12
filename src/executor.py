import os
import json
import typing_extensions as typing
import google.generativeai as genai
from dataclasses import dataclass
import logging
import google_calendar_api as gcal

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

# Import planner and memory helpers
from planner import parse_goals_to_tasks, optimize_schedule
from memory import log_memory


class Task(typing.TypedDict):
    id: str
    title: str
    priority: str  # "P1", "P2", "P3"
    estimated_duration_minutes: int
    constraint_type: str  # "fixed" or "flexible"
    fixed_time_iso: Optional[str] = None  # e.g., "2023-10-27T12:00:00" or null

class ScheduleEvent(typing.TypedDict):
    summary: str
    start_iso: str
    end_iso: str
    description: str
    event_type: str # "task", "break", "buffer"


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
    date_iso = req.date_iso or (os.environ.get("CURRENT_DATE") or None)
    try:

        current_calendar_events = gcal_events = gcal.get_calendar_events()

        tasks = parse_goals_to_tasks(req.text, date_iso or "", current_calendar_events)

        # Optionally log to memory
        try:
            log_memory({"type": "parse", "input": req.text, "tasks": tasks})
        except Exception:
            logger.debug("Memory logging failed for parse")
        return {"tasks": tasks}
    except Exception as e:
        logger.exception("Error while parsing brain dump")
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/optimize")
def optimize_schedule_endpoint(req: OptimizeRequest):
    try:
        free_windows = req.free_windows
        if not free_windows:
            # create a default free window for today from 09:00 to 18:00
            date_iso = os.environ.get("CURRENT_DATE") or datetime.date.today().isoformat()
            free_windows = [{
                "start": f"{date_iso}T09:00:00",
                "end": f"{date_iso}T21:00:00"
            }]

        logger.debug("Optimize request: tasks=%s free_windows=%s", req.tasks, free_windows)
        schedule = optimize_schedule(req.tasks, free_windows)
        try:
            log_memory({"type": "optimize", "tasks": req.tasks, "schedule": schedule})
        except Exception:
            logger.debug("Memory logging failed for optimize")
        logger.debug("Optimize response: %s", schedule)
        return {"events": schedule}
    except Exception as e:
        logger.exception("Error while optimizing schedule")
        raise HTTPException(status_code=500, detail=str(e))

