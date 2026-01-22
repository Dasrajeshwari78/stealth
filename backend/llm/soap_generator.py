import json
import re
from backend.llm.gemini_client import get_gemini_client
from backend.llm.prompts import SOAP_PROMPT

def extract_json(text: str) -> dict:
    # ... (your existing extract_json function) ...
    text = text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError(f"Gemini did not return JSON:\n{text}")
    return json.loads(match.group())

def generate_soap_note(conversation: list[dict]) -> dict:
    client = get_gemini_client()

    prompt = SOAP_PROMPT.format(
        conversation=json.dumps(conversation, indent=2)
    )

    # Ensure this is correct
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    if not response.text:
        raise ValueError("Empty response from Gemini")

    return extract_json(response.text)