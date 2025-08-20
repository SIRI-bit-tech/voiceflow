import asyncio
from typing import List, Tuple
import numpy as np
from speechbrain.pretrained import SpeakerRecognition


class SpeakerIdService:
    def __init__(self) -> None:
        # Downloads model on first use
        self._rec = SpeakerRecognition.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb", savedir=".cache/speechbrain"
        )

    async def embed_file(self, wav_path: str) -> List[float]:
        def _embed() -> List[float]:
            emb = self._rec.encode_batch(wav_path)
            vec = emb.squeeze().detach().cpu().numpy()
            return vec.astype(float).tolist()

        return await asyncio.to_thread(_embed)

    @staticmethod
    def cosine_similarity(a: List[float], b: List[float]) -> float:
        va = np.array(a)
        vb = np.array(b)
        denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1.0
        return float(np.dot(va, vb) / denom)

    async def average_embeddings(self, wav_paths: List[str]) -> List[float]:
        embeddings = [await self.embed_file(p) for p in wav_paths]
        arr = np.array(embeddings)
        mean_vec = arr.mean(axis=0)
        return mean_vec.astype(float).tolist()


