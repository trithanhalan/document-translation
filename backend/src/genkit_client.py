import requests
import os
from .utils import get_logger

logger = get_logger(__name__)

# The Genkit server is running within the Next.js frontend container
# The default Genkit port is 3400.
# From within the backend container, we can access it via its service name `frontend`.
GENKIT_API_BASE_URL = os.environ.get("GENKIT_API_URL", "http://localhost:3400/api")

def call_genkit_flow(flow_name: str, payload: dict, stream=False) -> dict:
    """
    Calls a Genkit flow via its REST API.
    
    Args:
        flow_name (str): The name of the flow to call.
        payload (dict): The input data for the flow.
        stream (bool): Whether to stream the response.

    Returns:
        dict: The JSON response from the flow.
    """
    url = f"{GENKIT_API_BASE_URL}/flows/{flow_name}"
    if stream:
        url += "/stream"

    headers = {"Content-Type": "application/json"}
    json_payload = {"input": payload}

    logger.info(f"Calling Genkit flow '{flow_name}' at {url} with payload: {payload}")

    try:
        response = requests.post(url, headers=headers, json=json_payload)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Genkit flow '{flow_name}': {e}")
        # In a real-world scenario, you might want to handle different
        # exceptions (e.g., ConnectionError, Timeout) differently.
        raise

def translate_with_llm_flow(text: str, src_lang: str, tgt_lang: str) -> str:
    """
    Calls the 'translateWithLLMFallbackFlow' Genkit flow.

    Args:
        text (str): The text to translate.
        src_lang (str): The source language code.
        tgt_lang (str): The target language code.

    Returns:
        str: The translated text.
    """
    flow_name = "translateWithLLMFallbackFlow"
    payload = {
        "text": text,
        "src_lang": src_lang,
        "tgt_lang": tgt_lang,
    }

    try:
        result = call_genkit_flow(flow_name, payload)
        
        # The flow output is nested under 'output'
        translation = result.get("output", {}).get("translation")
        
        if not translation:
            logger.error(f"LLM translation result is missing 'translation' key. Response: {result}")
            raise ValueError("Invalid response format from translation flow.")
            
        logger.info(f"LLM translation successful for text: '{text[:30]}...'")
        return translation
    except Exception as e:
        logger.error(f"An exception occurred during LLM translation flow: {e}")
        raise
