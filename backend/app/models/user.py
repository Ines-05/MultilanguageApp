from sqlalchemy import Column, Integer, String, DateTime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    default_language = Column(String, default="en")
    language_level = Column(String, default="standard")
    created_at = Column(DateTime)