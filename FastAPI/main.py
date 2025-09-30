from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from asyncio import sleep
import json
import uvicorn
from google import genai
from google.genai import types


class Prompt(BaseModel):
    text: str


app = FastAPI()
client = genai.Client(api_key="AIzaSyC-rE0Ggpz0AlNeYVC3aoJXBmz2j2YS9eI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


async def generate(prompt: str):
    for chunk in client.models.generate_content_stream(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0)
        ),
    ):
        yield f"data: {json.dumps({'chunk': chunk.text, 'done': False})}\n\n"
        await sleep(0)

    yield f"data: {json.dumps({'chunk': "", 'done': True})}\n\n"


@app.post("/generate-response", status_code=200)
async def generate_response(prompt: Prompt):
    return StreamingResponse(
        generate(prompt.text),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
