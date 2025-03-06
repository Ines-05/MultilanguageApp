# app/user.py

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config import ALGORITHM, SECRET_KEY
from app.dependencies import get_current_user, get_db
from app.models.user import User

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    id: int

class UserCreate(BaseModel):
    password: str
    default_language: str = "en"
    language_level: str = "standard"


class UserResponse(BaseModel):
    id: int
    username: str
    default_language: str
    language_level: str
    created_at: datetime


def authenticate_user(username: str, password: str, db: Session):
    """
    Authenticates a user by checking if the provided username and password match the user's credentials in the database.

    Args:
        username (str): The username of the user.
        password (str): The password of the user.
        db (Session): The database session.

    Returns:
        User: The authenticated user if the credentials are valid, None otherwise.
    """
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password):
        return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create an access token.

    Args:
        data (dict): The data to be encoded in the token.
        expires_delta (timedelta, optional): The expiration time delta for the token. Defaults to None.

    Returns:
        str: The encoded access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    """
    Verify if a plain password matches a hashed password.

    Args:
        plain_password (str): The plain password to be verified.
        hashed_password (str): The hashed password to compare against.

    Returns:
        bool: True if the plain password matches the hashed password, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    """
    Endpoint to access a protected resource.

    Args:
        current_user (str): The current user accessing the resource.

    Returns:
        dict: A dictionary containing a message confirming access to the protected resource.
    """
    return {
        "message": f"Hello {current_user}, you have access to this protected resource"
    }


@router.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get information about the currently authenticated user.

    Args:
        current_username (str): The username of the current authenticated user.
        db (Session): The database session.

    Returns:
        UserResponse: The user information.
    """
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/create_user/{username}", response_model=dict)
async def create_user(username: str, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user with the given username and password.

    Args:
        username (str): The username of the new user.
        user_data (UserCreate): The user data containing password and preferences.
        db (Session): The database session.

    Returns:
        dict: A dictionary containing the message "User created successfully".
    """
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = pwd_context.hash(user_data.password)

    # Create user with additional fields
    new_user = User(
        username=username,
        password=hashed_password,
        default_language=user_data.default_language,
        language_level=user_data.language_level,
        created_at=datetime.utcnow()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "id": new_user.id}


@router.delete("/delete_user/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user from the database.

    Args:
        user_id (int): The ID of the user to delete.
        db (Session): The database session.

    Returns:
        dict: A dictionary with a message indicating the success of the operation.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


@router.post("/token", response_model=TokenResponse)
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Logs in a user and returns an access token.

    Args:
        form_data (OAuth2PasswordRequestForm): The form data containing the username and password.
        db (Session): The database session.

    Returns:
        dict: A dictionary containing the access token, token type, and user ID.
    """
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "id": user.id}