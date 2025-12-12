from typing import List, Optional
import json
import logging
import typing_extensions as typing
from llm import GeminiExecutor

logger = logging.getLogger(__name__)


class Task(typing.TypedDict):
    id: str
    title: str
    priority: str
    estimated_duration_minutes: int
    constraint_type: str
    fixed_time_iso: Optional[str]


class ScheduleEvent(typing.TypedDict):
    summary: str
    start_iso: str
    end_iso: str
    description: str
    event_type: str


def parse_goals_to_tasks(user_input: str, current_date_iso: str) -> List[dict]:
    """Break down user goals into structured tasks using the LLM executor."""
    exe = GeminiExecutor()
    system_prompt = f"""
You are a task parser. Extract tasks from user input.
Date: {current_date_iso}
Priority: P1=urgent, P2=standard, P3=low
Duration: estimate if missing (call=15m, gym=60m, meeting=30m, work=120m)
Constraints: if user says \"at 1pm\", mark constraint_type=\"fixed\" and set fixed_time_iso
IDs: short unique strings (t1, t2, etc)
Split tasks >2 hours into 1-hour blocks with 15min breaks.
Be concise. Output only valid JSON.
    """

    print (f"System PROMPT: {system_prompt}")
    resp = exe.generate_json(system_prompt, f"User Goal Description: {user_input}", response_schema=list[Task])
    try:
        return json.loads(resp.text)
    except Exception:
        logger.exception("Failed to parse LLM response")
        return []



def optimize_schedule(tasks: List[dict], current_events: List[dict], free_windows: Optional[List[dict]] = None) -> List[dict]:
    exe = GeminiExecutor()
    system_prompt = f"""
    Current Calendar Events: Given is the start and end date and time of events already in the calendar: {current_events}. Do not schedule tasks that overlap with these events, instead choose slots around these start and end dates.
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
    print(f"System PROMPT OPTIMIZER: {system_prompt}")

    payload = json.dumps({"tasks_to_schedule": tasks, "available_time_windows": free_windows}, indent=2)
    resp = exe.generate_json(system_prompt, f"Optimize this schedule:\n{payload}", response_schema=list[ScheduleEvent])
    try:
        return json.loads(resp.text)
    except Exception:
        logger.exception("Failed to parse optimizer response")
        return []
