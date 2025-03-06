from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    username: str
    email: str
    hashed_password: str

class UserInDB(User):
    id: str

class Message(BaseModel):
    sender: str
    receiver: str
    content: str
    timestamp: datetime