import asyncio
from pathlib import Path
from typing import Optional

from gtts import gTTS


class TTSService:
    def __init__(self, output_dir: str = ".cache/tts") -> None:
        self.output_path = Path(output_dir)
        self.output_path.mkdir(parents=True, exist_ok=True)

    async def synthesize_to_file(self, text: str, lang: str = "en") -> str:
        def _synthesize() -> str:
            tts = gTTS(text=text, lang=lang)
            file_path = self.output_path / f"tts_{abs(hash(text+lang))}.mp3"
            tts.save(str(file_path))
            return str(file_path)

        return await asyncio.to_thread(_synthesize)


