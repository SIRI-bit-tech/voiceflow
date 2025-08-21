from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.routers import api_router
from .api.routers.streaming import router as streaming_router


app = FastAPI(title=settings.app_name)

# Configure CORS
origins_raw = settings.backend_cors_origins or ""
configured = [o.strip() for o in origins_raw.split(",") if o.strip()]
local_dev = ["http://localhost:4200", "http://127.0.0.1:4200"]
allow_list = list({*configured, *local_dev}) if configured else local_dev

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(api_router)
app.include_router(streaming_router)

@app.websocket("/ws/echo")
async def websocket_echo(ws: WebSocket) -> None:
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(data)
    except Exception:
        await ws.close()


