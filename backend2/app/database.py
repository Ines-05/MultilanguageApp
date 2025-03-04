from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.chat_db
users_collection = db.users
messages_collection = db.messages