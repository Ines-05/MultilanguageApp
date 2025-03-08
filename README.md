Multilanguage Chat App
======================

Une application de chat en temps réel permettant aux utilisateurs de communiquer dans différentes langues. Chaque message est automatiquement traduit en fonction des préférences linguistiques et du registre choisi (familier, courant, soutenu).

Table des Matières
------------------

*   [Vue d'ensemble](#vue-densemble)
*   [Fonctionnalités](#fonctionnalites)
*   [Architecture](#architecture)
*   [Installation et Configuration](#installation)
*   [Utilisation](#utilisation)
*   [Dépendances](#dependances)
*   [Roadmap](#roadmap)
*   [Licence](#licence)
*   [Ressources](#ressources)

Vue d'ensemble
--------------

Cette application de messagerie en temps réel se compose de deux parties principales :

*   **Frontend** : Interface utilisateur (React) pour choisir les langues et visualiser les traductions
*   **Backend** : Serveur FastAPI gérant WebSockets, base de données et traduction via mBART

Fonctionnalités
---------------

*   Traduction en temps réel
*   Adaptation du registre (familier/courant/soutenu)
*   Communication via WebSockets
*   Prévisualisation des traductions
*   Mise en cache avec Redis

Architecture
------------


        flowchart TD
            A[Frontend (React)] -- WebSocket/HTTP --> B[Backend (FastAPI)]
            B -- Modèles de traduction --> C[mBART / Hugging Face]
            B -- Cache --> D[Redis]
            B -- Persistance --> E[Base de données]


Installation et Configuration
-----------------------------

### Backend

1.  Cloner le dépôt :

        git clone https://github.com/votre-utilisateur/multilanguage-chat-app.git
        cd multilanguage-chat-app/backend

2.  Créer l'environnement virtuel :

        python -m venv venv
        source venv/bin/activate  # Windows: venv\Scripts\activate
        pip install -r requirements.txt

3.  Lancer le serveur :

        uvicorn app.main:app --reload


### Frontend

1.  Accéder au dossier :

        cd ../frontend

2.  Installer les dépendances :

        npm install

3.  Démarrer l'application :

        npm start


Utilisation
-----------

Accédez à [http://localhost:3000](http://localhost:3000) et configurez vos préférences linguistiques pour commencer à chatter.

Dépendances
-----------

### Backend

*   FastAPI
*   SQLAlchemy
*   Redis
*   mBART

### Frontend

*   React
*   WebSockets
*   Axios

Roadmap
-------

*   Intégration STT/TTS
*   Optimisation des performances
*   Tests automatisés

Licence
-------

MIT - Voir le fichier [LICENSE](LICENSE)

Ressources
----------

*   📄 [Rapport du projet](./rapport.pdf)
*   📊 [Présentation](https://www.canva.com/design/DAGhEp3TYBo/m1arhBrVLdqe5nuq-NE7rA/edit?utm_content=DAGhEp3TYBo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)