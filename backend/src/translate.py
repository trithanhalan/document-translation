import os
from functools import lru_cache
from transformers import MarianMTModel, MarianTokenizer
from .utils import get_logger
from .glossary import GlossaryService
from .genkit_client import translate_with_llm_flow

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
        
        self.tokenizer = None
        self.model = None

        if not self.use_llm_fallback:
            try:
                logger.info(f"Loading local translation model: {self.model_name}")
                self.tokenizer = MarianTokenizer.from_pretrained(self.model_name)
                self.model = MarianMTModel.from_pretrained(self.model_name)
                logger.info("Local translation model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load local model {self.model_name}. Error: {e}")
                logger.warning("Falling back to mock translations as local model is unavailable.")
        else:
            logger.info("Using Genkit LLM for translation.")


    @lru_cache(maxsize=1024)
    def _translate_batch(self, texts: tuple[str, ...]) -> list[str]:
        """Helper to translate a batch of texts using the local Marian model."""
        if self.use_llm_fallback or not self.model or not self.tokenizer:
            # If LLM is forced or local model is not available, this method should not be called
            # but as a safeguard, we return mock translations.
            return [self._mock_translate(text) for text in texts]
            
        try:
            inputs = self.tokenizer(list(texts), return_tensors="pt", padding=True, truncation=True, max_length=512)
            translated_tokens = self.model.generate(**inputs)
            return self.tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)
        except Exception as e:
            logger.error(f"Error during batch translation: {e}")
            return [f"[Translation Error: {e}]" for _ in texts]

    def _llm_fallback_translate(self, text: str) -> str:
        """Translates a single text using the Genkit LLM flow."""
        logger.info(f"Initiating LLM translation for text: '{text[:50]}...'")
        try:
            return translate_with_llm_flow(text, self.src_lang, self.tgt_lang)
        except Exception as e:
            logger.error(f"Genkit LLM translation failed: {e}")
            return self._mock_translate(text) # Provide mock as a last resort

    def _mock_translate(self, text: str) -> str:
        """Provides a simple, obvious mock translation."""
        reversed_text = " ".join(reversed(text.split()))
        return f"[MOCK] {reversed_text}"

    def translate(self, text: str) -> str:
        """
        Translates a single piece of text.
        It applies pre-translation glossary replacements and post-translation adjustments.
        """
        if not text.strip():
            return ""

        # 1. Pre-translation: Apply glossary terms to the source text
        text_with_glossary, replacements = glossary_service.apply_glossary_to_source(text, self.tgt_lang)
        
        # 2. Translate
        if self.use_llm_fallback:
            translated_text = self._llm_fallback_translate(text_with_glossary)
        elif self.model and self.tokenizer:
            # Use the cached batch translation method even for a single text
            # Note: The input to the cached function must be a tuple.
            translated_text = self._translate_batch(tuple([text_with_glossary]))[0]
        else:
            # If model loading failed or not using LLM, always mock
            translated_text = self._mock_translate(text_with_glossary)

        # 3. Post-translation: Re-insert original glossary terms if needed
        final_translation = glossary_service.revert_glossary_placeholders(translated_text, replacements)
        
        return final_translation

# Example of how you might use this service
if __name__ == '__main__':
    # This block is for testing purposes only
    # Set environment variable to test LLM fallback
    # os.environ["USE_EXTERNAL_LLM"] = "true" 
    
    glossary_service.add_term("Non-destructive testing", "Zerstörungsfreie Prüfung", "de")
    ts = TranslationService(src_lang='en', tgt_lang='de')
    
    source_sentence = "Non-destructive testing (NDT) is a critical field."
    translation = ts.translate(source_sentence)
    
    print(f"Source: {source_sentence}")
    print(f"Translation: {translation}")
    # Expected output (with local model): 'Zerstörungsfreie Prüfung (NDT) ist ein kritisches Feld.'
    # Expected output (with LLM): A high-quality translation of the sentence.
