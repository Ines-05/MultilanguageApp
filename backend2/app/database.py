# backend2/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de la base de données (à adapter selon votre configuration)
DATABASE_URL = "sqlite:///./test.db"

# Création du moteur de base de données
engine = create_engine(DATABASE_URL)

# Session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles SQLAlchemy
Base = declarative_base()