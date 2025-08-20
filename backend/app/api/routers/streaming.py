from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import base64
import asyncio
from typing import Dict, Any
from collections import deque
from ...services.nlu_service import NLUService
from ...services.stt_whisper_service import WhisperSTTService
from ...services.redis_service import get_redis


router = APIRouter(prefix="/ws", tags=["ws"]) 
nlu = NLUService()
stt = WhisperSTTService(model_name="base")
redis_client = get_redis()

# Store active connections and audio buffers
connections: Dict[str, Any] = {}


async def process_audio_chunk(ws: WebSocket, user_id: str, audio_data: bytes) -> None:
    """Process audio chunk and send partial results"""
    if user_id not in connections:
        connections[user_id] = {"buffer": deque(maxlen=50), "partial_text": ""}
    
    connections[user_id]["buffer"].append(audio_data)
    
    # When buffer has enough data, process with Whisper
    if len(connections[user_id]["buffer"]) >= 10:
        try:
            # Combine chunks and save to temp file
            import tempfile
            import wave
            import numpy as np
            
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                # Convert base64 to PCM and write WAV
                pcm_data = base64.b64decode(audio_data)
                with wave.open(tmp.name, 'wb') as wav:
                    wav.setnchannels(1)
                    wav.setsampwidth(2)
                    wav.setframerate(16000)
                    wav.writeframes(pcm_data)
                
                # Transcribe with Whisper
                text = await stt.transcribe_file(tmp.name)
                if text and text != connections[user_id]["partial_text"]:
                    connections[user_id]["partial_text"] = text
                    await ws.send_text(json.dumps({
                        "type": "stt_partial",
                        "text": text,
                        "confidence": 0.8
                    }))
        except Exception as e:
            print(f"Audio processing error: {e}")


async def broadcast_presence(user_id: str, action: str, workspace_id: str = None) -> None:
    """Broadcast user presence to workspace"""
    message = {
        "type": "presence",
        "user_id": user_id,
        "action": action,
        "workspace_id": workspace_id,
        "timestamp": asyncio.get_event_loop().time()
    }
    await redis_client.publish("presence", json.dumps(message))


@router.websocket("/voice")
async def voice_socket(ws: WebSocket, user_id: str = None) -> None:
    await ws.accept()
    if not user_id:
        await ws.close(code=4001, reason="User ID required")
        return
    
    await broadcast_presence(user_id, "connected")
    
    try:
        await ws.send_text(json.dumps({"type": "hello", "message": "connected"}))
        while True:
            message = await ws.receive()
            
            if message["type"] == "websocket.receive":
                if "text" in message:
                    raw = message["text"]
                elif "bytes" in message:
                    # Handle binary audio data
                    audio_data = message["bytes"]
                    await process_audio_chunk(ws, user_id, audio_data)
                    continue
                else:
                    continue
            else:
                continue
            
            try:
                msg = json.loads(raw)
            except Exception:
                await ws.send_text(json.dumps({"type": "error", "message": "invalid json"}))
                continue

            if msg.get("type") == "audio_frame":
                # Handle base64 encoded audio frame
                audio_data = msg.get("data", "")
                await process_audio_chunk(ws, user_id, audio_data.encode())
            elif msg.get("type") == "final":
                text = msg.get("text", "")
                intent = nlu.detect_intent(text)
                
                # Log command for analytics
                await redis_client.lpush("command_log", json.dumps({
                    "user_id": user_id,
                    "text": text,
                    "intent": intent,
                    "timestamp": asyncio.get_event_loop().time()
                }))
                
                await ws.send_text(json.dumps({
                    "type": "stt_final",
                    "text": text,
                    "nlu": intent,
                }))
            else:
                await ws.send_text(json.dumps({"type": "noop"}))
    except WebSocketDisconnect:
        if user_id in connections:
            del connections[user_id]
        await broadcast_presence(user_id, "disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await ws.close()


@router.websocket("/collab/{workspace_id}")
async def collab_socket(ws: WebSocket, workspace_id: str, user_id: str = None) -> None:
    await ws.accept()
    if not user_id:
        await ws.close(code=4001, reason="User ID required")
        return
    
    await broadcast_presence(user_id, "joined", workspace_id)
    
    try:
        while True:
            message = await ws.receive_text()
            msg = json.loads(message)
            
            # Broadcast to other users in workspace
            await redis_client.publish(f"collab:{workspace_id}", json.dumps({
                "user_id": user_id,
                "type": msg.get("type"),
                "data": msg.get("data"),
                "timestamp": asyncio.get_event_loop().time()
            }))
    except WebSocketDisconnect:
        await broadcast_presence(user_id, "left", workspace_id)
    except Exception as e:
        print(f"Collaboration error: {e}")
        await ws.close()


@router.websocket("/spatial/{workspace_id}")
async def spatial_socket(ws: WebSocket, workspace_id: str, user_id: str = None) -> None:
    await ws.accept()
    if not user_id:
        await ws.close(code=4001, reason="User ID required")
        return
    
    try:
        while True:
            message = await ws.receive_text()
            msg = json.loads(message)
            
            # Broadcast spatial position to other users
            await redis_client.publish(f"spatial:{workspace_id}", json.dumps({
                "user_id": user_id,
                "position": msg.get("position"),
                "room": msg.get("room"),
                "timestamp": asyncio.get_event_loop().time()
            }))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Spatial error: {e}")
        await ws.close()


