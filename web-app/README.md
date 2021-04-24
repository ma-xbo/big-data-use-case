# Web App

-> Tutorial: https://dev.to/nburgess/creating-a-react-app-with-react-router-and-an-express-backend-33l3

Die Web App hat einen eigenen Express Server, der zB die Daten aus der MySQL Datenbank ausließt und der Web App bereitstellt. 
Zudem stellt der Express Server auch die gebuildete React App bereit.

## Lokales starten der Anwendung

### Option 1: NodeJS
Die Anwendung kann mit dem Befehl `node server.js` gestartet werden.

### Option 2: Nodemon
Zum Starten der Anwendung mit Nodemon muss das dazugehörige Paket installiert sein. 
Nachdem das Paket installiert wurde kann das Paket eingesetzt werden.
Folgender Befehl muss dazu auf der Kommandozeile eingegeben werden: `npx nodemon server.js`

## Verwendung als Docker Container

- Befehl zum Erstellen des Containers: `docker build -t web-app:latest .`
- Befehl zum Starten des Containers: `docker run --rm -ti -p 3001:3001 --name node-web-app web-app`

## Verwendete NPM Pakete
- Express
