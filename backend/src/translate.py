import os
from functools import lru_cache
from transformers import MarianMTModel, MarianTokenizer
from .utils import get_logger
from .glossary import GlossaryService

# Initialize logger
logger = get_logger(__name__)

# Initialize glossary service
glossary_service = GlossaryService()

class TranslationService:
    def __init__(self, src_lang='en', tgt_lang='de'):
        self.src_lang = src_lang
        self.tgt_lang = tgt_lang
        self.model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'
        self.use_llm_fallback = os.environ.get("USE_EXTERNAL_LLM", "false").lower() == "true"
        
        try:
            logger.info(f"Loading translation model: {self.model_name}")
            self.tokenizer = MarianTokenizer.from_pretrained(self.model_name)
            self.model = MarianMTModel.from_pretrained(self.model_name)
            logger.info("Translation model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load translation model {self.model_name}. Translations will be mocked. Error: {e}")
            self.tokenizer = None
            self.model = None

    @lru_cache(maxsize=1024)
    def _translate_batch(self, texts):
        """Helper to translate a batch of texts using the local Marian model."""
        if not self.model or not self.tokenizer:
            return [self._mock_translate(text) for text in texts]
            
        try:
            inputs = self.tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=512)
            translated_tokens = self.model.generate(**inputs)
            return self.tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)
        except Exception as e:
            logger.error(f"Error during batch translation: {e}")
            return [f"[Translation Error: {e}]" for _ in texts]

    def _llm_fallback_translate(self, text: str) -> str:
        """Fallback to an LLM for translation (conceptual)."""
        # This is where you would integrate Genkit or another LLM client.
        # For now, it returns a mock translation.
        logger.warning(f"LLM fallback is not implemented. Using mock translation for: '{text[:50]}...'")
        return self._mock_translate(text)

    def _mock_translate(self, text: str) -> str:
        """Provides a simple, obvious mock translation."""
        reversed_text = " ".join(reversed(text.split()))
        return f"[MOCK] {reversed_text}"

    def translate(self, text: str) -> str:
        """
        Translates a single piece of text.
        It applies pre-translation glossary replacements and post-translation adjustments.
        """
        if not text:
            return ""

        # 1. Pre-translation: Apply glossary terms to the source text
        text_with_glossary, replacements = glossary_service.apply_glossary_to_source(text, self.tgt_lang)
        
        # 2. Translate
        if self.use_llm_fallback:
            translated_text = self._llm_fallback_translate(text_with_glossary)
        elif self.model and self.tokenizer:
            # Use the cached batch translation method even for a single text
            translated_text = self._translate_batch(tuple([text_with_glossary]))[0]
        else:
            # If model loading failed, always mock
            translated_text = self._mock_translate(text_with_glossary)

        # 3. Post-translation: Re-insert original glossary terms if needed
        final_translation = glossary_service.revert_glossary_placeholders(translated_text, replacements)
        
        return final_translation

# Example of how you might use this service
if __name__ == '__main__':
    # This block is for testing purposes only
    glossary_service.add_term("Non-destructive testing", "Zerstörungsfreie Prüfung", "de")
    ts = TranslationService(src_lang='en', tgt_lang='de')
    
    source_sentence = "Non-destructive testing (NDT) is a critical field."
    translation = ts.translate(source_sentence)
    
    print(f"Source: {source_sentence}")
    print(f"Translation: {translation}")
    # Expected output might be: 'Zerstörungsfreie Prüfung (NDT) ist ein kritisches Feld.'

    