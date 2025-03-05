# backend2/app/main.py
from fastapi import FastAPI
from .endpoints import router

app = FastAPI()

# Ajouter les routes de l'API
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Hello World"}