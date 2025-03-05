# backend2/app/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from .models import UserInDB

router = APIRouter()

@router.get("/users/me")
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.post("/token")
async def login_for_access_token():
    # Logique pour générer un token
    return {"token": "example_token"}