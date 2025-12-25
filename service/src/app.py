import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.get("/fastapi")
async def root():
    return {"msg": "fastapi server running!"}


app.include_router(chat.router)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5432)
