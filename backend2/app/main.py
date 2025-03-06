from fastapi import FastAPI
from app.endpoints import router

app = FastAPI()
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Welcome to the chat application"}