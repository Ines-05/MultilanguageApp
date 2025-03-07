import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.config import SECRET_KEY, ALGORITHM
from app.dependencies import get_current_user_ws, get_db
from app.managers import WebSocketConnectionManager
from app.models.chat import ChatMessage, PrivateMessage
from starlette import status
from app.translation_service import translate_for_user

router = APIRouter()
manager = WebSocketConnectionManager()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    current_user: str = Depends(get_current_user_ws),
    db: Session = Depends(get_db),
):
    # Supprimez cet appel car manager.connect() l'appelle déjà
    # await websocket.accept()
    # Connecter l'utilisateur avec current_user obtenu via le token
    await manager.connect(websocket, room_id, current_user)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                from_lang = message_data.get("fromLanguage", "fr")
                to_langs = message_data.get("toLanguages", ["en"])
                register = message_data.get("register", "courant")
            except Exception:
                content = data
                from_lang = "fr"
                to_langs = ["en"]
                register = "courant"

            translations = await translate_for_user(content, from_lang, to_langs, register)

            # Enregistrement du message original dans la base de données
            message = ChatMessage(user_id=current_user, room_id=room_id, content=content)
            db.add(message)
            db.commit()

            # Diffusion du message traduit à chaque utilisateur dans sa langue
            for target_lang, translated_content in translations.items():
                await manager.broadcast_message(
                    f"{current_user} ({target_lang}): {translated_content}", room_id
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast_message(f"User {current_user} left the room", room_id)

@router.websocket("/ws_private/{other_user_id}")
async def private_message_websocket(
    websocket: WebSocket,
    other_user_id: str,
    current_user: str = Depends(get_current_user_ws),
    db: Session = Depends(get_db),
):
    # Supprimez cet appel car manager.connect() l'appelle déjà
    # await websocket.accept()
    # Connecter en utilisant other_user_id comme identifiant de "room" pour le chat privé
    await manager.connect(websocket, other_user_id, current_user)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                from_lang = message_data.get("fromLanguage", "fr")
                to_lang = message_data.get("toLanguage", "en")
                register = message_data.get("register", "courant")
            except Exception:
                content = data
                from_lang = "fr"
                to_lang = "en"
                register = "courant"

            translations = await translate_for_user(content, from_lang, other_user_id, register, db)
            translated_content = translations[to_lang]

            # Enregistrement du message privé dans la base de données
            message = PrivateMessage(
                sender_id=current_user, receiver_id=other_user_id, content=content
            )
            db.add(message)
            db.commit()

            # Diffusion du message traduit via broadcast_message
            await manager.broadcast_message(
                f"{current_user}: {translated_content}", other_user_id
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, other_user_id)
        await manager.broadcast_message(
            f"User {current_user} left the private chat", other_user_id
        )
