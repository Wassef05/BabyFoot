# Projet Projet BabyFoot Manager et Chat avec Socket.IO

#Description du projet

BabyFoot Manager est une application web de type RIA permettant de créer des parties de babyfoot. Sa
particularité sera de pouvoir créer des parties de manière collaborative. 


Ce projet est un exemple d'application de Baby-foot_manager avec chat en temp réel utilisant Socket.IO.

## Installation

Pour installer ce projet localement, suivez ces étapes :

1. Clonez ce repository.
2. Installez les dépendances avec `npm install`.

## Utilisation
db : postgresql
CREATE TABLE game (
      id SERIAL PRIMARY KEY,
      status VARCHAR(255),
      name VARCHAR(255)
    );
Pour démarrer le serveur, utilisez la commande : nodemon server 

Ensuite, ouvrez votre navigateur et accédez à `http://localhost:3000` pour voir l'application de Baby-foot_manager.
