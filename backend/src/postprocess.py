import docx
from .utils import get_logger

logger = get_logger(__name__)

def reassemble_docx(original_doc: docx.Document, translated_segments: list, output_path: str):
    """
    Replaces the text in the original DOCX document with translated segments.
    This version correctly maps translated segments back to their original paragraphs.
    """
    logger.info(f"Reassembling DOCX file. Found {len(translated_segments)} translated segments.")
    
    # Create a dictionary to map paragraph index to translated text for quick lookup
    # This assumes that the `paragraph_index` was correctly stored during preprocessing
    translation_map = {
        seg['paragraph_index']: seg['translation'] 
        for seg in translated_segments if 'paragraph_index' in seg
    }
    
    # Iterate through all paragraphs in the original document with their index
    for i, para in enumerate(original_doc.paragraphs):
        # Check if this paragraph's index is in our translation map
        if i in translation_map:
            # This paragraph was translated, so we need to replace its content
            translated_text = translation_map[i]
            
            # Clear existing content (runs) in the paragraph
            # We clear runs instead of just `para.text = ''` to better handle complex docs
            for run in para.runs:
                run.clear()

            # Add the translated text in a single new run
            # This preserves paragraph-level formatting (like alignment, indentation)
            # but will lose inline formatting (like bold, italic within the para).
            # A more advanced implementation would map segment to run, but this is robust.
            para.add_run(translated_text)
            
    logger.info(f"Finished updating {len(translation_map)} paragraphs with translated content.")

    try:
        original_doc.save(output_path)
        logger.info(f"Successfully saved reassembled DOCX to {output_path}")
    except Exception as e:
        logger.error(f"Failed to save reassembled DOCX file: {e}")
        raise

    