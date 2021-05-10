# Beschreibung Big Data Use Case

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
   - Starten von Minikube mit mehr RAM über Docker: `minikube start --memory 8192 --cpus 4 --driver=docker`
   - Starten von Minikube mit mehr RAM über HyperV: `minikube start --memory 8192 --cpus 4 --driver=hyperv`

2. Strimzi.io Kafka operator erstellen und starten

   - `helm repo add strimzi http://strimzi.io/charts/`
   - `helm install my-kafka-operator strimzi/strimzi-kafka-operator`

3. Hadoop cluster with YARN (for checkpointing)

   - `helm repo add stable https://charts.helm.sh/stable`
   - `helm install --namespace=default --set hdfs.dataNode.replicas=1 --set yarn.nodeManager.replicas=1 --set hdfs.webhdfs.enabled=true my-hadoop-cluster stable/hadoop`

4. Starten der Anwendung

   - Befehl: `skaffold dev`
   
Alternativ:
   - `skaffold run --port-forward=user --tail` zum Beenden muss dann der Befehl `skaffold delete` eingegeben werden

Nachdem der use Case ein mal aufgebaut wurde, müssen nicht alle Schritte erneut durchlaufen werden. Wie der Use Case in den darauffolgenden Malen gestartet werden kann, ist nachfolgend beschrieben.

## Wiederholtes Starten des Use Case

Das wiederholte Starten des Use Case geht deutlich schneller, als das initiale Starten. Dazu müssen die folgenden Schritte beachtet sein.

1. Starten von Minikube

   - Starten von Minikube mit mehr RAM: `minikube start --memory 8192 --cpus 4 --driver=docker` oder `minikube start --memory 8192 --cpus 4 --driver=hyperv`

2. Starten der Anwendung

   - `skaffold dev`
   - `skaffold run --port-forward=user --tail`

## Prüfende Schritte

Sobald das Minikube Cluster läuft, sollten die folgenden Schritte geprüft werden:

- Laufen alle Pods, die für den Use Case benötigt werden? -> `kubectl get all`
- Kann von Außen auf den Data Generator Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress
- Kann von Außen auf den Web App Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress

### Weiterleiten des Ports

Die Ports der Komponenten des K8s Cluster können entweder manuell oder automatisiert weitergeleitet werden.

#### Manueller Port-Forward über kubectl

- Erreichen der Web App über den localhost: `kubectl port-forward service/web-app-service 5000:5000`
- Erreichen des Data Generator über den localhost: `kubectl port-forward service/datagenerator-app-service 3000:3000`

#### Automatisierter Port-Forward mit skaffold

- Standard: `skaffold dev`
- Entwicklung des Frontend (Build Prozess wird nicht jedes mal neu angestoßen): `skaffold run --port-forward=user --tail`

Informationen:
- https://skaffold.dev/docs/references/cli/
- https://skaffold.dev/docs/pipeline-stages/port-forwarding/

### Aktivieren des Ingress Addons (Gibt Fehlermeldung)

- Verwenden des Befhels: `minikube addons enable ingress` -> Funktioniert nur bei Linux
- `minikube tunnel`

## Befehle zum Managen des Clusters

Eine Übersicht aller Kommandos zum Managen des Minikube Clusters finden Sie unter: https://minikube.sigs.k8s.io/docs/start/

Nachfolgend sind häufig verwendete Kommandos aufgelistet:

- `kubectl get all`
- `kubectl get ingress`
- `kubectl describe service/web-app-service`

### PowerShell Skript zum Aktualisieren des Pod Status

Befehl: `while (1) {cls; kubectl get pods;sleep 2}`

### Überprüfen der Daten in MySql

1. Ausführen des Befehls `kubectl exec pod/mysql-deployment-7757cfc6b4-k55br -it -- bash` um Zugriff auf den MySql Pod zu bekommen
2. Befehl: `mysql --user=root --password` Anschließend muss das Passwort "mysecretpw" eingegeben werden
3. Befehl: `show databases;` zum Anzeigen der angelegten Datenbanken
4. Befehl: `USE popular;` zum nachfolgenden Zugreifen auf die Tabellen der Datenbank "popular"
5. Befehl: `SELECT * FROM count_store;` Beispielhafte SQL Abfrage
