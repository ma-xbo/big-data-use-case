# Beschreibung Big Data Use Case
Um von außerhalb des Kubernetes Clusters auf die Webanwendung zugreifen zu können, kommt ein Ingress zum Einsatz. Ein Ingress stellt HTTP- und HTTPS Anfragen von außerhalb des Kubernetes Clusters zu den definierten Diensten innerhalb des Kubernetes Clusters durch. Das Routing des Datenverkehrs wird durch Regeln gesteuert, die auf der Ingress-Ressource definiert sind. Für die Erfüllung der Ingress Konfiguration wird ein Ingress Controller innerhalb des Kubernetes Clusters benötigt. In der Big Data Anwendung wird dazu der NGINX Ingress Controller eingesetzt.

![image](https://user-images.githubusercontent.com/38072209/122688330-ec93ef00-d21b-11eb-85d9-db3eadeaebf2.png)

Neben dem Ingress Controller und den Webanwendungen werden zusätzliche Komponenten für die Datenverarbeitung und -speicherung benötigt. Dazu zählt eine Apache Kafka Instanz, welche neue Bestellungen von dem Daten Generator in Form von Kafka Messages erhält. Mit Hilfe der Apache Spark Instanz werden die Kafka Messages gelesen, verarbeitet bzw. aufbereitet und anschließend in der MySQL Datenbank gespeichert. Die Webanwendung zur Darstellung der Bestellübersicht zeigt die durch die Spark Anwendung aufbereiteten Daten an. Zur Entlastung der Datenbank Instanz kommt zusätzlich ein Cache Server zum Einsatz.

![image](https://user-images.githubusercontent.com/38072209/122688364-1fd67e00-d21c-11eb-915f-fed014d156e2.png)

## Prerequisite: Installation von Docker, Minikube, etc.

Die nachfolgenden Schritte müssen einmalig durchgeführt werden, um das Projekt auf einem Windows Rechner zum Laufen zu bringen:

- Installation Docker (durch Installationsdatei von [Docker Desktop](https://www.docker.com/products/docker-desktop)) -> `docker`
- Installation minikube (durch Minikube Installationsdatei) -> `minikube`, `kubectl`
- Installation helm -> `helm`
  - Herunterladen der benötigten Dateien unter https://github.com/helm/helm/releases
  - Entpacken der ZIP Datei
  - Kopieren der `helm.exe` in `%USERPROFILE%\AppData\Local\Microsoft\WindowsApps`
- Installation skaffold
  - Herunterladen der Datei von https://storage.googleapis.com/skaffold/releases/latest/skaffold-windows-amd64.exe
  - Umbennen der Datei in `skaffold.exe`
  - Kopieren der Datei in `%USERPROFILE%\AppData\Local\Microsoft\WindowsApps`

## Erstmaliges Starten des Use Case

1. Starten von Minikube

   - Starten von Minikube mit Standardwerten: `minikube start`
   - Starten von Minikube mit mehr Ressourcen über Docker: `minikube start --memory 8192 --cpus 4 --driver=docker`
   - Starten von Minikube mit mehr Ressourcen über HyperV: `minikube start --memory 8192 --cpus 4 --driver=hyperv`

2. Aktivieren des Ingress Addons in Minikube

    Hinweis: Auf Windows Systemen kann das Ingress Addon nicht in Verbindung mit Docker genutzt werden. Es empfiehlt sich HyperV zu nutzen. 

    Der Befehl zum Aktivieren des Ingress addons lautet: `minikube addons enable ingress`

3. Strimzi.io Kafka operator erstellen und starten

   - `helm repo add strimzi http://strimzi.io/charts/`
   - `helm install my-kafka-operator strimzi/strimzi-kafka-operator`

4. Hadoop cluster with YARN (for checkpointing)

   - `helm repo add stable https://charts.helm.sh/stable`
   - `helm install --namespace=default --set hdfs.dataNode.replicas=1 --set yarn.nodeManager.replicas=1 --set hdfs.webhdfs.enabled=true my-hadoop-cluster stable/hadoop`

5. Starten der Anwendung

   - Befehl: `skaffold dev`

Nachdem der use Case ein mal aufgebaut wurde, müssen nicht alle Schritte erneut durchlaufen werden. Wie der Use Case in den darauffolgenden Malen gestartet werden kann, ist nachfolgend beschrieben.

## Wiederholtes Starten des Use Case

Das wiederholte Starten des Use Case geht deutlich schneller, als das initiale Starten. Dazu müssen die folgenden Schritte beachtet sein.

1. Starten von Minikube: `minikube start`
2. Starten der Anwendung: `skaffold dev`

## Zugriff auf die Webanwendungen

Sobald das Minikube Cluster läuft, sollten die folgenden Schritte geprüft werden:

- Laufen alle Pods, die für den Use Case benötigt werden? -> `kubectl get all`
- Kann von Außen auf den Data Generator Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress
- Kann von Außen auf den Web App Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress
 
Um über das Ingress auf die Webanwendungen zugreifen zu können wird die IP Adresse benötigt. 
Diese wird über den Befehl `minikube ip` ausgegeben.
Auf die Bestellübersicht wird über den Pfad `<minikube-ip>/orders/list` zugegriffen.
Auf den Datengenerator wird über den Pfad `<minikube-ip>/simulator/overview` zugegriffen.

#### Automatisierter Port-Forward mit skaffold

In der Datei skaffold.yaml kann das forwarden der ports definiert werden. Dies wird dann automatisch durchgeführt. Nachfolgend ist der Ausschnitt einer skaffold.yaml Datei zu sehen in der Port-Forward definiert ist:

```yaml
portForward:
  - resourceType: Deployment
    resourceName: web-app
    port: 5000
  - resourceType: Deployment
    resourceName: datagenerator-app
    port: 3000
```

Weitere Informationen zum Port-Forwarding:
- https://skaffold.dev/docs/references/cli/
- https://skaffold.dev/docs/pipeline-stages/port-forwarding/

Unterschiedliche Befehle zum Starten der Anwendung mit Hilfe von Skaffold:
- Standard: `skaffold dev`
- Entwicklung des Frontend (Build Prozess wird nicht jedes mal neu angestoßen): `skaffold run --port-forward=user --tail` zum Beenden muss dann der Befehl `skaffold delete` eingegeben werden

## Befehle zum Managen des Clusters

Nachfolgend sind häufig verwendete Kommandos aufgelistet:

- `kubectl get all`
- `kubectl get ingress`
- `kubectl describe service/web-app-service`
- `kubectl delete pod/AAA`
- PowerShell Skript zum Aktualisieren des Pod Status `while (1) {cls; kubectl get pods;sleep 2}`

#### Manueller Port-Forward zum Erreichen der Webanwendung mit Hilfe von kubectl

- Erreichen der Web App über den localhost: `kubectl port-forward service/web-app-service 5000:5000`
- Erreichen des Data Generator über den localhost: `kubectl port-forward service/datagenerator-app-service 3000:3000`

Eine Übersicht aller Kommandos zum Managen des Minikube Clusters finden Sie unter: https://minikube.sigs.k8s.io/docs/start/

### Überprüfen der Daten in MySql

1. Ausführen des Befehls `kubectl exec pod/mysql-deployment-7757cfc6b4-k55br -it -- bash` um Zugriff auf den MySql Pod zu bekommen
2. Befehl: `mysql --user=root --password` Anschließend muss das Passwort "mysecretpw" eingegeben werden
3. Befehl: `show databases;` zum Anzeigen der angelegten Datenbanken
4. Befehl: `USE popular;` zum nachfolgenden Zugreifen auf die Tabellen der Datenbank "popular"
5. Befehl: `SELECT * FROM count_store;` Beispielhafte SQL Abfrage
