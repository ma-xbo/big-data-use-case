# Datagenerator

## Lokales starten der Anwendung

### Option 1: NodeJS
Die Anwendung kann mit dem Befehl `node server.js` gestartet werden.

### Option 2: Nodemon
Zum Starten der Anwendung mit Nodemon muss das dazugehörige Paket installiert sein. 
Nachdem das Paket installiert wurde kann das Paket eingesetzt werden.
Folgender Befehl muss dazu auf der Kommandozeile eingegeben werden: `npx nodemon server.js`

## Verwendung als Docker Container

- Befehl zum Erstellen des Containers: `docker build -t datagenerator-app:latest .`
- Befehl zum Starten des Containers: `docker run --rm -ti -p 3000:3000 --name node-data-generator datagenerator-app`

## Verwendete NPM Pakete
- Express
- halfmoon
    - Responsive front-end Framework
    - Ähnlich zu Bootstrap
- remixicon
    - Icon Set über css Klassen
    - Beispiel: `<i class="ri-home-line"></i>`
- uuid
    -  Erstellen von UUID's
    -  Das Format einer UUID sieht wie folgt aus: `7bff4110-dbec-4968-82ab-81c855961abc`

## Quellen:
- https://nodejs.org/en/docs/guides/timers-in-node/
- https://www.gethalfmoon.com/docs/introduction/
