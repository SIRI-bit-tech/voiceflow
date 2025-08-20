from fastapi import APIRouter, WebSocket
import json
from ...services.nlu_service import NLUService


router = APIRouter(prefix="/ws", tags=["ws"]) 

nlu = NLUService()


@router.websocket("/voice")
async def voice_socket(ws: WebSocket) -> None:
    await ws.accept()
    try:
        await ws.send_text(json.dumps({"type": "hello", "message": "connected"}))
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                await ws.send_text(json.dumps({"type": "error", "message": "invalid json"}))
                continue

            if msg.get("type") == "partial":
                await ws.send_text(json.dumps({"type": "stt_partial", "text": msg.get("text", "")}))
            elif msg.get("type") == "final":
                text = msg.get("text", "")
                intent = nlu.detect_intent(text)
                await ws.send_text(json.dumps({
                    "type": "stt_final",
                    "text": text,
                    "nlu": intent,
                }))
            else:
                await ws.send_text(json.dumps({"type": "noop"}))
    except Exception:
        await ws.close()


