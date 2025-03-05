

# 📌 Backend - MultilanguageApp

## 🚀 Lancement de l'application  

Avant de démarrer l'application, assurez-vous d'avoir installé toutes les dépendances nécessaires :  

```bash
pip install -r requirements.txt
```

Ensuite, lancez le serveur avec la commande :  

```bash
python -m uvicorn app.main:app --reload
```

## 📂 Structure du projet  

```
backend2/
│── app/
│   ├── main.py
│   ├── endpoints/
│   ├── models/
│   ├── services/
│   ├── config.py
│── requirements.txt
│── README.md
```

## ⚠️ Dépannage  

Si vous obtenez une erreur du type :  
```
ModuleNotFoundError: No module named 'app'
```
Essayez d’exécuter la commande depuis le dossier `backend2` et non `app` :
```bash
cd backend2
python -m uvicorn app.main:app --reload
```

---

## 📌 À propos  
Ce backend fait partie de l'application **MultilanguageApp**. Il est construit avec **FastAPI** et **Uvicorn**.

💡 *N'hésitez pas à contribuer et à signaler les bugs !* 🚀
```

### ✅ Explications des améliorations :
1. **Ajout d’une installation des dépendances** (`pip install -r requirements.txt`).
2. **Ajout d'une structure de dossier** pour clarifier l’organisation du projet.
3. **Ajout d’une section "Dépannage"** pour éviter ton problème de `ModuleNotFoundError`.
4. **Ajout d’un bloc "À propos"** pour donner plus d’informations sur le projet.
