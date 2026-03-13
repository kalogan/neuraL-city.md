from __future__ import annotations

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from model_runner import ModelRunner
from activation_extractor import extract_mock_activations

app = FastAPI(title="Neural City API")
runner = ModelRunner()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ActivationRequest(BaseModel):
    prompt: str


@app.post('/activation')
async def activation(payload: ActivationRequest) -> dict:
    return runner.run_prompt(payload.prompt)


@app.websocket('/ws/activations')
async def websocket_activations(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        for layer in extract_mock_activations(layer_count=6, neurons_per_layer=800):
            await websocket.send_json({
              "layer": {
                  "layer": layer.layer,
                  "neurons": layer.neurons,
                  "attention": layer.attention,
                  "logits": layer.logits,
              }
          })
            await asyncio.sleep(0.35)
    except WebSocketDisconnect:
        print('WebSocket disconnected')


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
