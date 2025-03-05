# backend2/app/models.py
from pydantic import BaseModel
from .database import Base
from sqlalchemy import Column, Integer, String

# Modèle Pydantic pour les utilisateurs
class UserInDB(BaseModel):
    username: str
    email: str
    hashed_password: str

    @classmethod
    def get_user(cls, username: str):
        # Logique pour récupérer un utilisateur depuis la base de données
        return cls(username="example", email="example@example.com", hashed_password="hashed_password")

# Modèle SQLAlchemy pour les utilisateurs
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)