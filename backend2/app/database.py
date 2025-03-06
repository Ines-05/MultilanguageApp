# backend2/app/database.py
from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Remplacez par votre URI MongoDB
db = client["multilanguage_app"]  # Nom de la base de données

# Collections MongoDB
users_collection = db["users"]