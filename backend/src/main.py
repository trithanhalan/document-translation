from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import os

from .orchestrator import run_translation_pipeline
from .utils import get_logger

# Create a logger instance
logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LinguaFlow Backend",
    description="Handles document ingestion, translation, and processing.",
    version="1.0.0",
)

class TranslationRequest(BaseModel):
    """Defines the structure for a translation processing request."""
    taskId: str

@app.get("/healthz", status_code=200)
def health_check():
    """Endpoint for health checks."""
    logger.info("Health check endpoint was called.")
    return {"status": "ok"}

@app.post("/process", status_code=202)
async def process_document(request: TranslationRequest, background_tasks: BackgroundTasks):
    """
    Main endpoint to kick off the document translation pipeline.
    It accepts a taskId and runs the entire process in the background.
    """
    task_id = request.taskId
    logger.info(f"Received request to process task ID: {task_id}")

    if not task_id:
        logger.error("Validation Error: taskId is missing from the request.")
        raise HTTPException(status_code=400, detail="taskId is required.")

    # Add the long-running translation job to the background
    background_tasks.add_task(run_translation_pipeline, task_id=task_id)

    logger.info(f"Task {task_id} has been accepted and scheduled for processing.")
    return {"message": "Translation process started successfully.", "taskId": task_id}

# Optional: Add other endpoints as needed, e.g., for status checks or downloads.
# @app.get("/status/{task_id}")
# def get_task_status(task_id: str):
#     # This would query Firestore to get the latest status.
#     # Implementation is omitted for brevity but would be a good addition.
#     return {"taskId": task_id, "status": "fetching..."}

    