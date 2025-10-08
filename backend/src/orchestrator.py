import os
import tempfile
import traceback
from .utils import get_logger, initialize_firebase_backend, update_task_status, download_from_storage
from .preprocess import process_document
from .translate import TranslationService
from .postprocess import reassemble_docx

# Initialize logger
logger = get_logger(__name__)

# Firebase services will be initialized once in main.py and passed around or accessed globally
db, storage_bucket = initialize_firebase_backend()

def run_translation_pipeline(task_id: str):
    """
    The main orchestration function that runs the entire document translation pipeline.
    """
    if not db or not storage_bucket:
        logger.error(f"Task {task_id}: Cannot run pipeline due to Firebase initialization failure.")
        # Attempt to update status to failed, even if db might be unavailable
        try:
            task_ref_for_error = firestore.client().collection('translationTasks').document(task_id)
            update_task_status(task_ref_for_error, 'failed', error_message="Internal server error: Firebase connection failed.")
        except Exception as fe:
             logger.critical(f"Task {task_id}: Also failed to update task to failed status: {fe}")
        return

    logger.info(f"Starting translation pipeline for task ID: {task_id}")
    task_ref = db.collection('translationTasks').document(task_id)

    try:
        task_doc = task_ref.get()
        if not task_doc.exists:
            logger.error(f"Task {task_id}: Document not found in Firestore.")
            return

        task_data = task_doc.to_dict()
        file_name = task_data.get("fileName")
        src_lang = task_data.get("srcLang")
        tgt_lang = task_data.get("tgtLang")
        
        if not all([file_name, src_lang, tgt_lang]):
            missing = [k for k,v in {'fileName': file_name, 'srcLang': src_lang, 'tgtLang': tgt_lang}.items() if not v]
            error_message = f"Task data is incomplete. Missing: {', '.join(missing)}"
            logger.error(f"Task {task_id}: {error_message}")
            update_task_status(task_ref, 'failed', error_message=error_message)
            return

        source_blob_path = f"uploads/{task_id}/{file_name}"
        logger.info(f"Task {task_id}: Source file path is {source_blob_path}")

        # 1. Preprocessing: Download and extract text/segments
        update_task_status(task_ref, 'preprocessing', 30, "Extracting document content.")
        with tempfile.TemporaryDirectory() as temp_dir:
            local_file_path = os.path.join(temp_dir, file_name)
            
            logger.info(f"Task {task_id}: Downloading file to {local_file_path}")
            download_from_storage(storage_bucket, source_blob_path, local_file_path)
            
            logger.info(f"Task {task_id}: Processing document for segmentation.")
            segments, original_doc = process_document(local_file_path)

            if not segments:
                update_task_status(task_ref, 'failed', error_message="No text could be extracted from the document.")
                logger.error(f"Task {task_id}: Preprocessing failed, no segments found.")
                return

            # Store segments in a subcollection
            segments_ref = task_ref.collection('segments')
            batch = db.batch()
            for seg in segments:
                seg_doc_ref = segments_ref.document(str(seg['id']))
                batch.set(seg_doc_ref, seg)
            batch.commit()
            logger.info(f"Task {task_id}: Stored {len(segments)} segments in Firestore.")

            # 2. Translation
            update_task_status(task_ref, 'translating', 60, "Translating segments.")
            translation_service = TranslationService(src_lang=src_lang, tgt_lang=tgt_lang)
            
            translated_segments = []
            for i, seg in enumerate(segments):
                translated_text = translation_service.translate(seg['sourceText'])
                translated_segment = {**seg, "translation": translated_text}
                translated_segments.append(translated_segment)
                # Update segment in Firestore with translation
                segments_ref.document(str(seg['id'])).update({"translation": translated_text})

                intermediate_progress = 60 + int(30 * ((i + 1) / len(segments)))
                update_task_status(task_ref, 'translating', intermediate_progress)

            # 3. Post-processing: Reassemble document
            update_task_status(task_ref, 'reassembling', 95, "Reassembling translated document.")
            
            file_extension = os.path.splitext(file_name)[1]
            output_file_name = f"translated_{os.path.splitext(file_name)[0]}{file_extension}"
            local_output_path = os.path.join(temp_dir, output_file_name)
            
            if file_name.endswith('.docx') and original_doc:
                reassemble_docx(original_doc, translated_segments, local_output_path)
                output_blob_path = f"results/{task_id}/{output_file_name}"
                blob = storage_bucket.blob(output_blob_path)
                blob.upload_from_filename(local_output_path)
                
                update_task_status(task_ref, 'completed', 100, "Translation complete. Ready for download.", outputs={"final_document": output_blob_path})
                logger.info(f"Task {task_id}: Successfully reassembled DOCX and uploaded to {output_blob_path}")
            else:
                # For non-DOCX files or cases where reassembly isn't supported,
                # we just mark as ready for review so segments can be seen in the UI.
                update_task_status(task_ref, 'review', 100, "Translation complete. Segments are ready for review.")
                logger.info(f"Task {task_id}: Translation complete. Manual review/download needed for non-DOCX file.")
                
    except Exception as e:
        error_message = f"An error occurred in the pipeline: {e}\n{traceback.format_exc()}"
        logger.error(f"Task {task_id}: {error_message}")
        update_task_status(task_ref, 'failed', error_message=error_message)

    