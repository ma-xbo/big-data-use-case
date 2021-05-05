# Web App Client

## Lokales Starten der Anwendung im Development Mode

Die Anwendung kann mit dem Befehl `npm start` gestartet werden. 
Der Befehl muss unter dem Pfad `big-data-use-case\web-app\client` eingegeben werden.
Die Anwendung läuft im 'Development Mode' und kann über [http://localhost:5001](http://localhost:5001) im Browser dargestellt werden.
Der Port der Anwendung im Development Mode kann in der Datei `.env` modifiziert werden.

## Lokales Starten der Anwendung im Production Mode
Um die Anwendung im 'Production Mode' laufen zu lassen muss zunächst ein 'Production Build' der Anwendung erstellt werden. 
Dies erfolgt durch das Eingeben des Begehls `npm run build` unter dem Pfad `big-data-use-case\web-app\client`.

Der Express Server wurde so konfiguriert, dass er das Production Build der Anwendung bereitstellt.
Der Express Server wird über den Befehl `node server.js` (alternativ `npx nodemon server.js`) unter dem Pfad `big-data-use-case\web-app` gestartet.
Die Anwendung kann dann über [http://localhost:5000](http://localhost:5000) im Browser erreicht werden.

## Verwendung im Docker Image
Das Production Build der React Anwendung wird für den Docker Container automatisch erstellt. 
Dazu wird die Funktionalität "Multi-Stage Builds" von Docker genutzt (siehe: https://docs.docker.com/develop/develop-images/multistage-build/).
In dem sogennanten "Intermediate Image" wird das Production Build der React Anwendung erstellt.
In einem zweiten Schritt wird das Production Build aus dem Intermediate Image in das Haupt-Image kopiert und anschließend der Server gestartet. 

## Quellen
- https://reactjs.org/docs/getting-started.html
- https://reactrouter.com/web/guides/quick-start
- https://www.gethalfmoon.com/docs/introduction/
- https://remixicon.com/
- https://docs.docker.com/develop/develop-images/multistage-build/