import pytesseract
from PIL import Image
import io
from .utils import get_logger

logger = get_logger(__name__)

def ocr_image(image_bytes: bytes) -> str:
    """
    Performs OCR on an image provided as bytes and returns the extracted text.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        logger.error(f"Pytesseract OCR failed: {e}")
        # Depending on the setup, this might indicate Tesseract is not installed or not in PATH.
        logger.error("Ensure Tesseract is installed and configured in your environment's PATH.")
        return ""

if __name__ == '__main__':
    # Example usage: ocr_image(open('test_image.png', 'rb').read())
    # This requires a test image file to run.
    print("OCR module is ready. Use with image bytes.")

    