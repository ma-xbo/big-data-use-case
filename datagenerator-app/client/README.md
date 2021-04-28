# Data Generator Client

## Starten der Anwendung im Development Mode

Die Anwendung kann mit dem Befehl `npm start` gestartet werden. 
Der Befehl muss unter dem Pfad `big-data-use-case\datagenerator-app\client` eingegeben werden.
Die Anwendung läuft im 'Development Mode' und kann über [http://localhost:3001](http://localhost:3001) im Browser dargestellt werden.
Der Port der Anwendung im Development Mode kann in der Datei `.env` modifiziert werden.

## Erstellen eines Production Build der Client Anwendung
Um die Anwendung im 'Production Mode' laufen zu lassen, muss zunächst ein 'Production Build' der Anwendung erstellt werden. 
Dies erfolgt durch das Eingeben des Begehls `npm run build` unter dem Pfad `big-data-use-case\datagenerator-app\client`.

## Starten der Anwendung im Production Mode
Der Express Server wurde so konfiguriert, dass er das Production Build der Anwendung bereitstellt.
Der Express Server wird über den Befehl `node server.js` (alternativ `npx nodemon server.js`) unter dem Pfad `big-data-use-case\datagenerator-app` gestartet.
Die Anwendung kann dann über [http://localhost:3000](http://localhost:3000) im Browser erreicht werden.

## Verwendete NPM Pakete
- react
- react-router-dom
- halfmoon
  - Responsive front-end Framework
  - Ähnlich zu Bootstrap
- remixicon
  - Icon Set über css Klassen
  - Beispiel: `<i class="ri-home-line"></i>`

## Quellen
- https://reactjs.org/docs/getting-started.html
- https://reactrouter.com/web/guides/quick-start
- https://www.gethalfmoon.com/docs/introduction/
- https://remixicon.com/