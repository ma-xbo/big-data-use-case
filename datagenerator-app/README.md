# Datagenerator

Datenstruktur

```javascript
{
  order_id: 'cf1a37ab-e0f1-4661-a7b7-c135069c18e3',
  store_id: '61529f27-ff46-40a8-af3a-8228f0a294b7',
  dish_id: '61579f07-ff46-4078-af3a-8228f0a294b7',
  timestamp: '2021-04-26T18:03:48.771Z'
}
```

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
  - Erstellen von UUID's
  - Das Format einer UUID sieht wie folgt aus: `7bff4110-dbec-4968-82ab-81c855961abc`

## Quellen:

- https://nodejs.org/en/docs/guides/timers-in-node/
- https://www.gethalfmoon.com/docs/introduction/
