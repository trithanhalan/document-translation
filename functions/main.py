
# This file is deprecated and no longer used.
# The backend logic has been moved to a more robust FastAPI application.
# Please see the `/backend` directory for the new implementation.

import functions_framework

@functions_framework.cloud_event
def process_translation_task(cloud_event):
    """
    This function is deprecated. The new backend is a FastAPI service.
    """
    task_id = cloud_event.params.get('taskId', 'unknown')
    print(f"DEPRECATED: Received trigger for task ID: {task_id}. No action will be taken.")
    print("Please migrate to the new FastAPI backend architecture.")
    # To prevent retries or errors, we simply return a success response.
    return "Function is deprecated.", 204

    