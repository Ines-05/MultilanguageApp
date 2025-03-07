from fastapi import APIRouter, Depends, HTTPException
from nanoid.generate import generate
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.chat import ChatMessage, PrivateMessage
from app.models.user import User
router = APIRouter()


class GroupCreate(BaseModel):
    name: str
    members: list[str]


class PrivateCreate(BaseModel):
    receiver_id: int


@router.post("/conversations/group")
async def create_group_conversation(
        data: GroupCreate,
        current_user: str = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Crée une nouvelle conversation de groupe"""
    try:
        # Génération de l'ID de room
        room_id = f"group_{generate(size=8)}"

        # Vérification des membres
        for member_id in data.members:
            user = db.query(User).filter(User.id == member_id).first()
            if not user:
                raise HTTPException(status_code=404, detail=f"Utilisateur {member_id} introuvable")

        # Création du message de démarrage
        new_group = ChatMessage(
            user_id=current_user,
            room_id=room_id,
            content=f"Groupe {data.name} créé"
        )

        db.add(new_group)
        db.commit()

        return {
            "room_id": room_id,
            "name": data.name,
            "members": data.members
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création du groupe: {str(e)}"
        )


@router.post("/conversations/private")
async def create_private_conversation(
        data: PrivateCreate,
        current_user: str = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Crée une nouvelle conversation privée"""
    try:
        # Vérification du destinataire
        receiver = db.query(User).filter(User.id == data.receiver_id).first()
        if not receiver:
            raise HTTPException(status_code=404, detail="Destinataire introuvable")

        # Vérification conversation existante
        existing = db.query(PrivateMessage).filter(
            or_(
                and_(
                    PrivateMessage.sender_id == current_user,
                    PrivateMessage.receiver_id == data.receiver_id
                ),
                and_(
                    PrivateMessage.sender_id == data.receiver_id,
                    PrivateMessage.receiver_id == current_user
                )
            )
        ).first()

        if existing:
            return {"id": data.receiver_id, "username": data.receiver_id}

        # Création du premier message
        new_message = PrivateMessage(
            sender_id=current_user,
            receiver_id=data.receiver_id,
            content="Conversation démarrée"
        )

        db.add(new_message)
        db.commit()

        return {"id": data.receiver_id, "username": data.receiver_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création de la conversation: {str(e)}"
        )

@router.get("/history/{room_id}")
async def get_chat_history(room_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the chat history for a specific room.

    Args:
        room_id (str): The ID of the room.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        dict: A dictionary containing the chat history messages.
            Each message is represented by a dictionary with "user_id" and "content" keys.
    """
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.room_id == room_id)
        .order_by(ChatMessage.timestamp)
        .all()
    )
    return {
        "messages": [
            {
                "id": msg.id,
                "user_id": msg.user_id,
                "content": msg.content,
                "timestamp": msg.timestamp,
            } for msg in history
        ]
    }


@router.post("/send_private_message")
async def send_private_message(
    receiver_id: str,
    content: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a private message to a user.

    Args:
        receiver_id (str): The ID of the user who will receive the message.
        content (str): The content of the message.
        current_user (str, optional): The ID of the current user. Defaults to the result of the `get_current_user` dependency.
        db (Session, optional): The database session. Defaults to the result of the `get_db` dependency.

    Returns:
        dict: A dictionary with a success message indicating that the private message was sent successfully.
    """
    message = PrivateMessage(
        sender_id=current_user, receiver_id=receiver_id, content=content
    )
    db.add(message)
    db.commit()
    return {"message": "Private message sent successfully"}


@router.get("/private_messages/{other_user_id}")
async def get_private_messages(
    other_user_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve private messages between the current user and another user.

    Args:
        other_user_id (str): The ID of the other user.
        current_user (str, optional): The ID of the current user. Defaults to the user obtained from the `get_current_user` dependency.
        db (Session, optional): The database session. Defaults to the session obtained from the `get_db` dependency.

    Returns:
        dict: A dictionary containing the retrieved private messages, with each message represented as a dictionary with "sender_id" and "content" keys.
    """
    messages = (
        db.query(PrivateMessage)
        .filter(
            or_(
                and_(
                    PrivateMessage.sender_id == current_user,
                    PrivateMessage.receiver_id == other_user_id,
                ),
                and_(
                    PrivateMessage.sender_id == other_user_id,
                    PrivateMessage.receiver_id == current_user,
                ),
            )
        )
        .order_by(PrivateMessage.timestamp)
        .all()
    )

    return {
        "messages": [
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "timestamp": msg.timestamp,
            } for msg in messages
        ]
    }


@router.get("/conversations/private")
async def get_private_conversations(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère toutes les conversations privées de l'utilisateur
    """
    # Récupère tous les utilisateurs ayant une conversation
    users = db.query(User).filter(User.username != current_user).all()
    return [{"id": user.id, "username": user.username} for user in users]


@router.get("/conversations/group")
async def get_group_conversations(
        current_user: str = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Récupère toutes les conversations de groupe de l'utilisateur
    avec le nom du groupe extrait du premier message
    """
    # Récupère toutes les rooms distinctes où l'utilisateur a envoyé des messages
    distinct_rooms = db.query(ChatMessage.room_id).filter(
        ChatMessage.user_id == current_user
    ).distinct().all()

    groups = []
    for room in distinct_rooms:
        room_id = room.room_id

        # Trouve le message de création du groupe
        creation_message = db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id,
            ChatMessage.content.like("Groupe % créé")
        ).order_by(ChatMessage.timestamp.asc()).first()

        if creation_message:
            # Extrait le nom du groupe depuis le contenu
            name = creation_message.content.split("Groupe ")[1].split(" créé")[0]
            groups.append({
                "room_id": room_id,
                "name": name,
                "created_at": creation_message.timestamp
            })

    return groups