import docx
from .utils import get_logger

logger = get_logger(__name__)

def reassemble_docx(original_doc: docx.Document, translated_segments: list, output_path: str):
    """
    Replaces the text in the original DOCX document with translated segments.
    This is a simplified implementation that replaces paragraph by paragraph.
    A more advanced version would map segments back to their exact original run.
    """
    logger.info(f"Reassembling DOCX file. Found {len(translated_segments)} translated segments.")
    
    translated_para_texts = [seg['translation'] for seg in translated_segments]
    
    # Iterate through paragraphs in the original document
    para_idx_to_translate = 0
    for para in original_doc.paragraphs:
        if para.text.strip(): # If the paragraph is not empty
            if para_idx_to_translate < len(translated_para_texts):
                # Clear existing runs in the paragraph
                for run in para.runs:
                    run.text = ''
                # Add the translated text in a single new run
                # This preserves paragraph-level formatting but not inline formatting.
                para.add_run(translated_para_texts[para_idx_to_translate])
                para_idx_to_translate += 1
            else:
                logger.warning("More non-empty paragraphs in original doc than translated segments. Some text may not be translated.")
                break

    try:
        original_doc.save(output_path)
        logger.info(f"Successfully saved reassembled DOCX to {output_path}")
    except Exception as e:
        logger.error(f"Failed to save reassembled DOCX file: {e}")
        raise

    