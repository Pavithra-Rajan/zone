import json
from pathlib import Path
from typing import Any

MEMORY_FILE = Path(__file__).parent / "memories.jsonl"


def log_memory(item: Any):
    """Append a JSON line to the memories file."""
    with MEMORY_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(item, default=str) + "\n")


def read_memories():
    if not MEMORY_FILE.exists():
        return []
    with MEMORY_FILE.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]
