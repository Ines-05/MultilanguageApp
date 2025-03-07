# app/websocket.py
import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect,Query
from sqlalchemy.orm import Session

from jose import JWTError, jwt
from app.config import SECRET_KEY, ALGORITHM
from app.dependencies import get_current_user, get_db
from app.managers import WebSocketConnectionManager
from app.models.chat import ChatMessage, PrivateMessage
from starlette import status
from app.translation_service import translate_text

router = APIRouter()
manager = WebSocketConnectionManager()

@router.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_id: str = Depends(get_current_user),
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, room_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                from_lang = message_data.get("fromLanguage", "fr")
                to_langs = message_data.get("toLanguages", ["en"])  # Liste des langues cibles
                register = message_data.get("register", "courant")
            except Exception:
                content = data
                from_lang = "fr"
                to_langs = ["en"]  # Par défaut, traduire en anglais
                register = "courant"

            # Traduction pour chaque langue cible
            translations = await translate_text(content, from_lang, to_langs, register)

            # Enregistrement du message original dans la base de données
            message = ChatMessage(user_id=user_id, room_id=room_id, content=content)
            db.add(message)
            db.commit()

            # Diffusion du message traduit à chaque utilisateur dans sa langue
            for target_lang, translated_content in translations.items():
                await manager.broadcast_message(
                    f"{user_id} ({target_lang}): {translated_content}", room_id
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast_message(f"User {user_id} left the room", room_id)

@router.websocket("/ws_private/{other_user_id}")
async def private_message_websocket(
    websocket: WebSocket,
    other_user_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    await manager.connect_private(websocket, other_user_id, current_user)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                from_lang = message_data.get("fromLanguage", "fr")
                to_lang = message_data.get("toLanguage", "en")  # Langue cible unique
                register = message_data.get("register", "courant")
            except Exception:
                content = data
                from_lang = "fr"
                to_lang = "en"
                register = "courant"

            # Traduction du message
            translations = await translate_text(content, from_lang, [to_lang], register)
            translated_content = translations[to_lang]

            # Enregistrement du message privé dans la base de données
            message = PrivateMessage(
                sender_id=current_user, receiver_id=other_user_id, content=content
            )
            db.add(message)
            db.commit()

            # Diffusion du message traduit
            await manager.broadcast_private_message(
                f"{current_user}: {translated_content}", other_user_id
            )
    except WebSocketDisconnect:
        manager.disconnect_private(websocket, other_user_id)
        await manager.broadcast_private_message(
            f"User {current_user} left the private chat", other_user_id
        )
