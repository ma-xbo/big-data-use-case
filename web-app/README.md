# Web App Server

Die Web App unterteilt sich in einen Server-Teil und einen Client-Teil. 
Der Client-Teil dient der Darstellung der Daten und wird durch eine React App realisiert.
Für weitere Informationen zum Client-Teil der Web App schauen Sie bitte in den Ordner `big-data-use-case\web-app\client`. 
Dort befindet sich der Source-Code, sowie eine weitere README Datei.

Der Server-Teil der Web App wird mit Hilfe eines Express Servers realisiert und wird nachfolgend beschrieben.
Der Express Server wird dazu genutzt, um beispielweise aus der MySQL Datenbank auszulesen und diese dem Frontend (Client-Teil) der Web App bereitzustellen. 
Zudem stellt der Express Server auch das Production Build React App bereit. 
Die Anwendung kann dann über [http://localhost:5000](http://localhost:5000) im Browser erreicht werden.

## Lokales starten der Anwendung

### Option 1: NodeJS
Die Anwendung kann mit dem Befehl `node server.js` gestartet werden.

### Option 2: Nodemon
Zum Starten der Anwendung mit Nodemon muss das dazugehörige Paket installiert sein. 
Nachdem das Paket installiert wurde kann das Paket eingesetzt werden.
Folgender Befehl muss dazu auf der Kommandozeile eingegeben werden: `npx nodemon server.js`

## Verwendung als Docker Container
- Installieren der benötigten Pakete im Order `big-data-use-case\web-app` und `big-data-use-case\web-app\client` mit dem Befehl `npm install`
- Builden der React App im Ordner `big-data-use-case\web-app\client` mit dem Befehl `npm run build`
- Befehl zum Erstellen des Containers: `docker build -t web-app:latest .`
- Befehl zum Starten des Containers: `docker run --rm -ti -p 5000:5000 --name node-web-app web-app`

## Verwendete NPM Pakete
- Express
- CORS

## Quellen
- https://expressjs.com/en/starter/hello-world.html
- https://expressjs.com/en/resources/middleware/cors.html
- https://dev.to/nburgess/creating-a-react-app-with-react-router-and-an-express-backend-33l3