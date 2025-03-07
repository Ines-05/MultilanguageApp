# Multilanguage Chat App

Une application de chat en temps réel permettant aux utilisateurs de communiquer dans différentes langues. Chaque message est automatiquement traduit en fonction des préférences linguistiques et du registre choisi (familier, courant, soutenu).

---

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation et Configuration](#installation-et-configuration)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Utilisation](#utilisation)
- [Dépendances](#dépendances)
- [Roadmap](#roadmap)
- [Licence](#licence)

---

## Vue d'ensemble

Cette application de messagerie en temps réel se compose de deux parties principales :

- **Frontend** : une interface utilisateur (probablement développée avec React) permettant aux utilisateurs de choisir leurs langues, d'envoyer des messages, et de visualiser les traductions en direct.
- **Backend** : un serveur FastAPI gérant les WebSockets, la persistance des messages (via une base de données comme SQLite/PostgreSQL), la traduction des messages (avec le modèle mBART) et la mise en cache (via Redis).

---

## Fonctionnalités

- **Traduction en temps réel** : Chaque message envoyé est automatiquement traduit dans la langue de destination choisie par le destinataire.
- **Adaptation du registre** : Les messages peuvent être adaptés pour être affichés dans un registre familier, courant ou soutenu.
- **WebSockets** : Communication en temps réel pour un chat fluide dans des salons de discussion ou en messages privés.
- **Prévisualisation de la traduction** : Avant l'envoi, l'utilisateur voit une prévisualisation de la traduction.
- **Reconnaissance et Synthèse Vocale** *(à venir)* : Utilisation de modèles STT et TTS pour faciliter la communication vocale.
- **Mise en cache** : Utilisation de Redis pour stocker les traductions fréquentes et améliorer les performances.

---

## Architecture

L'application est structurée en deux répertoires principaux :

- **/frontend** : Code source du client, interface utilisateur et gestion de la communication WebSocket.
- **/backend** : Code source du serveur (FastAPI) qui gère les endpoints HTTP, WebSocket, traduction via mBART et la persistance des données.

## Ressources

📄 [Rapport du projet](./Rapport.docx)  
📊 [Présentation du projet](https://www.canva.com/design/DAGhEp3TYBo/m1arhBrVLdqe5nuq-NE7rA/edit?utm_content=DAGhEp3TYBo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton )

