from fastapi import FastAPI
from app.endpoints import router
app = FastAPI()
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}