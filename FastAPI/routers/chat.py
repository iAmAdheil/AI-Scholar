import json
from asyncio import sleep

from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types

from RAG.main import rag

class Prompt(BaseModel):
    text: str


router = APIRouter(prefix="/chat", tags=["chat"])

client = genai.Client(api_key="AIzaSyC-rE0Ggpz0AlNeYVC3aoJXBmz2j2YS9eI")


async def generate(prompt: str):
	rag_context = rag(prompt)
	for chunk in client.models.generate_content_stream(
		model="gemini-2.0-flash",
		contents=f"""
		Context: {rag_context}\n\n
		Question: {prompt}\n\n
		
		Rules:
		- You are a helpful assistant that can answer questions.
		- If you feel that provided context is not enough, you are free to answer that u don't know the answer.
		- Do **not** generate or formulate an answer to the query. Use context as your only source of truth to answer each question.
		- Please use markdown(bold, italics, tables, equations, etc.) wherever required to better format your answer.
		""",
		config=types.GenerateContentConfig(
			thinking_config=types.ThinkingConfig(thinking_budget=0)
		),
	):
		yield f"data: {json.dumps({'chunk': chunk.text, 'done': False})}\n\n"
		await sleep(0)

	yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"


@router.post("/response", status_code=200)
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
