import os
import json
import google.generativeai as genai
import logging
from typing import List, Any, Optional
import typing_extensions as typing

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

# Configure GenAI API key
GENAI_API_KEY = os.environ.get("GENAI_API_KEY", "")
genai.configure(api_key=GENAI_API_KEY)


class GeminiExecutor:
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name

    def _get_json_model(self, system_instruction: str, response_schema: Optional[Any] = None):
        config = {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        }
        if response_schema:
            config["response_schema"] = response_schema
        
        return genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction,
            generation_config=config,
        )

    def generate_json(self, system_instruction: str, user_prompt: str, response_schema: Optional[Any] = None):
        model = self._get_json_model(system_instruction, response_schema)
        response = model.generate_content(user_prompt)
        logger.debug("LLM response text: %s", getattr(response, "text", str(response)))
        return response
