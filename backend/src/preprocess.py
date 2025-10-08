import fitz  # PyMuPDF
import docx
import re
from .ocr import ocr_image
from .utils import get_logger

logger = get_logger(__name__)

def clean_text(text):
    """Removes extra whitespace and non-printable characters."""
    if not text:
        return ""
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove residual non-printable chars
    return "".join(char for char in text if char.isprintable())

def segment_text(text):
    """A simple paragraph-based segmenter."""
    if not text:
        return []
    # Split by one or more newlines
    paragraphs = re.split(r'\n+', text)
    return [p.strip() for p in paragraphs if p.strip()]

def process_pdf(file_path):
    """Extracts text and segments from a PDF, with OCR fallback."""
    logger.info(f"Processing PDF: {file_path}")
    doc = fitz.open(file_path)
    full_text = ""
    has_text = False

    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            has_text = True
            full_text += text + "\n"
        else:
            # No text layer, attempt OCR
            logger.warning(f"Page {page_num + 1} has no text layer. Attempting OCR.")
            try:
                pix = page.get_pixmap()
                img_bytes = pix.tobytes("png")
                ocr_text = ocr_image(img_bytes)
                if ocr_text:
                    logger.info(f"OCR successful for page {page_num + 1}.")
                    full_text += ocr_text + "\n"
                else:
                    logger.warning(f"OCR for page {page_num + 1} yielded no text.")
            except Exception as e:
                logger.error(f"Error during OCR on page {page_num + 1}: {e}")

    doc.close()
    
    if not has_text and not full_text.strip():
        logger.error("Document appears to be empty or image-based, and OCR failed.")
        return [], None
        
    segments_text = segment_text(full_text)
    segments = [
        {"id": f"seg_{i+1}", "sourceText": clean_text(seg), "translation": ""}
        for i, seg in enumerate(segments_text)
    ]
    return segments, None # No original doc object for PDFs

def process_docx(file_path):
    """Extracts text and segments from a DOCX file."""
    logger.info(f"Processing DOCX: {file_path}")
    doc = docx.Document(file_path)
    segments = []
    seg_id = 1
    
    for para in doc.paragraphs:
        if para.text.strip():
            cleaned = clean_text(para.text)
            segments.append({
                "id": f"seg_{seg_id}",
                "sourceText": cleaned,
                "translation": "",
                "paragraph_index": len(doc.paragraphs) - 1 # Store index for reassembly
            })
            seg_id += 1
            
    return segments, doc # Return the document object for reassembly


def process_document(file_path):
    """
    Determines the file type and routes it to the appropriate processor.
    Returns a list of segments and the original document object if applicable.
    """
    if file_path.lower().endswith('.pdf'):
        return process_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        return process_docx(file_path)
    elif file_path.lower().endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        segments_text = segment_text(text)
        segments = [
            {"id": f"seg_{i+1}", "sourceText": clean_text(seg), "translation": ""}
            for i, seg in enumerate(segments_text)
        ]
        return segments, None
    else:
        raise ValueError(f"Unsupported file type for: {file_path}")

    