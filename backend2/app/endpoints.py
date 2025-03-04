from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.database import users_collection, messages_collection  # Import absolu
from app.auth import get_current_user, create_access_token
from app.models import Message, User # Import de la classe Message

router = APIRouter()

# Modèle pour le token
class Token(BaseModel):
    access_token: str
    token_type: str

# Endpoint pour l'authentification
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint pour envoyer un message
@router.post("/send_message")
async def send_message(message: Message, current_user: User = Depends(get_current_user)):
    message.timestamp = datetime.utcnow()
    await messages_collection.insert_one(message.dict())
    return {"status": "Message sent"}

# Autres endpoints...# Autres endpoints...
@router.post("/register")
async def register(username: str, email: str, password: str):
    hashed_password = get_password_hash(password)
    user = {"username": username, "email": email, "hashed_password": hashed_password}
    result = await users_collection.insert_one(user)
    return {"id": str(result.inserted_id)}

@router.post("/send_message")
async def send_message(message: Message, current_user: User = Depends(get_current_user)):
    message.timestamp = datetime.utcnow()
    await messages_collection.insert_one(message.dict())
    return {"status": "Message sent"}

@router.get("/messages")
async def get_messages(current_user: User = Depends(get_current_user)):
    messages = await messages_collection.find({"$or": [{"sender": current_user.username}, {"receiver": current_user.username}]}).to_list(100)
    return messages

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    await manager.connect(websocket)
    try:
        user = await get_current_user(token)
        while True:
            data = await websocket.receive_text()
            message = Message(sender=user.username, receiver="recipient", content=data, timestamp=datetime.utcnow())
            await messages_collection.insert_one(message.dict())
            await manager.broadcast(f"Message sent: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)