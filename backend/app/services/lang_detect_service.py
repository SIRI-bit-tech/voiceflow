import asyncio
from typing import Dict, Any, Optional
from lingua import Language, LanguageDetectorBuilder
import spacy


class LanguageDetectionService:
    def __init__(self) -> None:
        # Initialize language detector with common languages
        self.detector = LanguageDetectorBuilder.from_languages(
            Language.ENGLISH,
            Language.SPANISH,
            Language.FRENCH,
            Language.GERMAN,
            Language.ITALIAN,
            Language.PORTUGUESE,
            Language.RUSSIAN,
            Language.CHINESE,
            Language.JAPANESE,
            Language.KOREAN,
        ).build()
        
        # Load spaCy models for supported languages
        self.nlp_models = {
            "en": spacy.load("en_core_web_sm"),
            "es": spacy.load("es_core_news_sm"),
            "fr": spacy.load("fr_core_news_sm"),
            "de": spacy.load("de_core_news_sm"),
        }
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect language from text"""
        if not text.strip():
            return {"language": "en", "confidence": 0.0}
        
        try:
            # Use lingua for detection
            confidence_values = self.detector.compute_language_confidence_values(text)
            if confidence_values:
                best_match = confidence_values[0]
                lang_code = self._map_language_to_code(best_match.language)
                return {
                    "language": lang_code,
                    "confidence": best_match.value,
                    "alternatives": [
                        {
                            "language": self._map_language_to_code(lang.language),
                            "confidence": lang.value
                        }
                        for lang in confidence_values[1:3]  # Top 3 alternatives
                    ]
                }
        except Exception as e:
            print(f"Language detection error: {e}")
        
        return {"language": "en", "confidence": 0.0}
    
    def _map_language_to_code(self, language: Language) -> str:
        """Map lingua Language enum to ISO code"""
        mapping = {
            Language.ENGLISH: "en",
            Language.SPANISH: "es",
            Language.FRENCH: "fr",
            Language.GERMAN: "de",
            Language.ITALIAN: "it",
            Language.PORTUGUESE: "pt",
            Language.RUSSIAN: "ru",
            Language.CHINESE: "zh",
            Language.JAPANESE: "ja",
            Language.KOREAN: "ko",
        }
        return mapping.get(language, "en")
    
    def get_whisper_model(self, lang_code: str) -> str:
        """Get appropriate Whisper model for language"""
        # Map language codes to Whisper model names
        model_mapping = {
            "en": "base.en",
            "es": "base",
            "fr": "base",
            "de": "base",
            "it": "base",
            "pt": "base",
            "ru": "base",
            "zh": "base",
            "ja": "base",
            "ko": "base",
        }
        return model_mapping.get(lang_code, "base")
    
    def get_tts_voice(self, lang_code: str) -> str:
        """Get appropriate TTS voice for language"""
        voice_mapping = {
            "en": "en-US",
            "es": "es-ES",
            "fr": "fr-FR",
            "de": "de-DE",
            "it": "it-IT",
            "pt": "pt-PT",
            "ru": "ru-RU",
            "zh": "zh-CN",
            "ja": "ja-JP",
            "ko": "ko-KR",
        }
        return voice_mapping.get(lang_code, "en-US")
    
    async def extract_entities(self, text: str, lang_code: str) -> Dict[str, Any]:
        """Extract named entities using spaCy"""
        if lang_code not in self.nlp_models:
            return {"entities": []}
        
        try:
            doc = self.nlp_models[lang_code](text)
            entities = [
                {
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                }
                for ent in doc.ents
            ]
            return {"entities": entities}
        except Exception as e:
            print(f"Entity extraction error: {e}")
            return {"entities": []}
    
    def get_language_name(self, lang_code: str) -> str:
        """Get human-readable language name"""
        names = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "zh": "Chinese",
            "ja": "Japanese",
            "ko": "Korean",
        }
        return names.get(lang_code, "English")
