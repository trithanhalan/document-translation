import logging
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from google.cloud.firestore_v1.base_document import DocumentSnapshot

def get_logger(name: str):
    """Configures and returns a logger with a standard format."""
    logger = logging.getLogger(name)
    if not logger.handlers: # Avoid adding handlers multiple times
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

_db = None
_storage_bucket = None
_firebase_app = None

def initialize_firebase_backend():
    """
    Initializes the Firebase Admin SDK.
    Uses GOOGLE_APPLICATION_CREDENTIALS for authentication in production,
    or falls back to a service account file if specified.
    """
    global _db, _storage_bucket, _firebase_app
    
    if _firebase_app:
        return _db, _storage_bucket

    try:
        logger = get_logger(__name__)
        project_id = os.environ.get('GCP_PROJECT') or os.environ.get('FIREBASE_PROJECT_ID')
        
        # In a managed environment (Cloud Run/Functions), credentials are automatically handled.
        # For local dev, GOOGLE_APPLICATION_CREDENTIALS env var should be set.
        cred = credentials.ApplicationDefault()
        
        # Get storage bucket name from env or infer from project ID
        bucket_name = os.environ.get('GCS_BUCKET')
        if not bucket_name and project_id:
            bucket_name = f"{project_id}.appspot.com"
        
        if not bucket_name:
            raise ValueError("Could not determine Storage bucket. Set GCS_BUCKET environment variable.")

        logger.info(f"Initializing Firebase Admin SDK for project '{project_id}' and bucket '{bucket_name}'")

        _firebase_app = firebase_admin.initialize_app(cred, {
            'projectId': project_id,
            'storageBucket': bucket_name
        })
        
        _db = firestore.client()
        _storage_bucket = storage.bucket()
        
        logger.info("Firebase Admin SDK initialized successfully.")
        return _db, _storage_bucket
    except Exception as e:
        logger.critical(f"Failed to initialize Firebase Admin SDK: {e}")
        raise

def update_task_status(task_ref, status, progress=None, message=None, outputs=None, error_message=None):
    """Updates a task document in Firestore with new status and optional fields."""
    logger = get_logger(__name__)
    update_data = {
        'status': status,
        'updatedAt': firestore.SERVER_TIMESTAMP
    }
    if progress is not None:
        update_data['progress'] = max(0, min(100, progress))
    if message:
        update_data['lastMessage'] = message
    if outputs:
        update_data['outputs'] = outputs
    if error_message:
        update_data['errors'] = firestore.ArrayUnion([str(error_message)])

    try:
        task_ref.update(update_data)
        logger.info(f"Updated task {task_ref.id} to status: {status}, progress: {progress}%")
    except Exception as e:
        logger.error(f"Failed to update Firestore for task {task_ref.id}: {e}")

def download_from_storage(bucket, blob_name, destination_file_path):
    """Downloads a file from Cloud Storage."""
    logger = get_logger(__name__)
    try:
        blob = bucket.blob(blob_name)
        blob.download_to_filename(destination_file_path)
        logger.info(f"File {blob_name} downloaded to {destination_file_path}.")
    except Exception as e:
        logger.error(f"Failed to download {blob_name} from Storage: {e}")
        raise

    