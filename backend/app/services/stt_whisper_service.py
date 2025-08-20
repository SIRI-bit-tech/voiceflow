import asyncio
from pathlib import Path
from typing import Optional

import whisper


class WhisperSTTService:
    def __init__(self, model_name: str = "base") -> None:
        self.model_name = model_name
        self._model = whisper.load_model(model_name)

    async def transcribe_file(self, audio_path: str, language: Optional[str] = None) -> str:
        def _transcribe() -> str:
            result = self._model.transcribe(audio_path, language=language)
            return result.get("text", "").strip()

        return await asyncio.to_thread(_transcribe)


