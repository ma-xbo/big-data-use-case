# Datagenerator

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
- halfmoon
    - Responsive front-end Framework
    - Ähnlich zu Bootstrap
- remixicon
    - Icon Set über css Klassen
    - Beispiel: `<i class="ri-home-line"></i>`
