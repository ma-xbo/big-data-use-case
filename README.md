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
   - Starten von Minikube mit mehr RAM: `minikube --memory 8192 --cpus 4 --driver=docker start`

2. Strimzi.io Kafka operator erstellen und starten

   - `helm repo add strimzi http://strimzi.io/charts/`
   - `helm install my-kafka-operator strimzi/strimzi-kafka-operator`

3. Hadoop cluster with YARN (for checkpointing)

   - `helm repo add stable https://charts.helm.sh/stable`
   - `helm install --namespace=default --set hdfs.dataNode.replicas=1 --set yarn.nodeManager.replicas=1 --set hdfs.webhdfs.enabled=true my-hadoop-cluster stable/hadoop`

4. Starten der Anwendung

   - Befehl: `skaffold dev`

Nachdem der use Case ein mal aufgebaut wurde, müssen nicht alle Schritte erneut durchlaufen werden. Wie der Use Case in den darauffolgenden Malen gestartet werden kann, ist nachfolgend beschrieben.

## Wiederholtes Starten des Use Case

Das wiederholte Starten des Use Case geht deutlich schneller, als das initiale Starten. Dazu müssen die folgenden Schritte beachtet sein.

1. Starten von Minikube

   - Starten von Minikube mit mehr RAM: `minikube --memory 8192 --cpus 4 --driver=docker start`

2. Starten der Anwendung
   - `skaffold dev`

## Prüfende Schritte

Sobald das Minikube Cluster läuft, sollten die folgenden Schritte geprüft werden:

- Laufen alle Pods, die für den Use Case benötigt werden? -> `kubectl get all`
- Kann von Außen auf den Data Generator Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress
- Kann von Außen auf den Web App Pod zugegriffen werden? -> Weiterleitung des Ports oder Ingress

### Weiterleiten des Ports

- Erreichen der Web App über den localhost: `kubectl port-forward service/web-app-service 5000:5000`
- Erreichen des Data Generator über den localhost: `kubectl port-forward service/datagenerator-app-service 3000:3000`

### Aktivieren des Ingress Addons (Gibt Fehlermeldung)

- Verwenden des Befhels: `minikube addons enable ingress` -> Funktioniert nur bei Linux
- `minikube tunnel`

## Befehle zum Managen des Clusters

Eine Übersicht aller Kommandos zum Managen des Minikube Clusters finden Sie unter: https://minikube.sigs.k8s.io/docs/start/

Nachfolgend sind häufig verwendete Kommandos aufgelistet:

- `kubectl get all`
- `kubectl get ingress`
- `kubectl describe service/web-app-service`
