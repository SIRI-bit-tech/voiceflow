import re
from rapidfuzz import fuzz
from typing import Dict, Any


class NLUService:
    def __init__(self) -> None:
        self.intent_keywords = {
            "navigate": ["navigate", "go to", "open", "enter"],
            "show": ["show", "list", "display"],
            "create": ["create", "new", "make"],
            "publish": ["publish", "push live"],
            "search": ["search", "find", "look for"],
            "move": ["move", "relocate", "archive"],
            "switch": ["switch", "change workspace"],
        }

    def detect_intent(self, text: str) -> Dict[str, Any]:
        cleaned = text.strip().lower()
        best_intent = None
        best_score = 0
        for intent, keys in self.intent_keywords.items():
            for k in keys:
                score = fuzz.partial_ratio(cleaned, k)
                if score > best_score:
                    best_score = score
                    best_intent = intent

        entities: Dict[str, Any] = {}
        # simplistic entity extraction
        m = re.search(r"(blog|pages?|archive|draft)s?", cleaned)
        if m:
            entities["category"] = m.group(1)
        m = re.search(r"last (week|month)", cleaned)
        if m:
            entities["date_range"] = m.group(0)

        return {
            "intent": best_intent or "unknown",
            "confidence": best_score / 100.0,
            "entities": entities,
        }


