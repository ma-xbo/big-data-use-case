# Beschreibung Big Data Use Case

## Installation von Software

Die nachfolgenden Schritte müssen einmalig durchgeführt werden:

- Installation Docker (durch Docker Desktop Installationsdatei) -> `docker`
- Installation minikube (durch Minikube Installationsdatei) -> `minikube`, `kubectl`
- Installation chocolatey = optional (durch PowerShell Skript) -> `choco`
- Installation helm (mit chocolatey über den Befehl `choco install kubernetes-helm`) -> `helm`
    - Herunterladen der benötigten Dateien unter https://github.com/helm/helm/releases
    - Entpacken der ZIP Datei
    - Kopieren der `helm.exe` in `%USERPROFILE%\AppData\Local\Microsoft\WindowsApps`
- Installation skaffold
    - Herunterladen der Datei von https://storage.googleapis.com/skaffold/releases/latest/skaffold-windows-amd64.exe
    - Umbennen der Datei in `skaffold.exe` 
    - Kopieren der Datei in `%USERPROFILE%\AppData\Local\Microsoft\WindowsApps`

## Starten des Use Case

1. Starten von Minikube 
    - Starten von Minikube mit Standardwerten: `minikube start` 
    - Starten von Minikube mit mehr RAM: `minikube --memory 8192 --cpus 4 --driver=docker start`

2. Strimzi.io Kafka operator erstellen und starten 

```bash
helm repo add strimzi http://strimzi.io/charts/
helm install my-kafka-operator strimzi/strimzi-kafka-operator
kubectl apply -f https://farberg.de/talks/big-data/code/helm-kafka-operator/kafka-cluster-def.yaml
```

3. Hadoop cluster with YARN (for checkpointing)

```bash
helm repo add stable https://charts.helm.sh/stable
helm install --namespace=default --set hdfs.dataNode.replicas=1 --set yarn.nodeManager.replicas=1 --set hdfs.webhdfs.enabled=true my-hadoop-cluster stable/hadoop
```

4. Starten der Anwendung
    - `skaffold dev`

### Weiterleiten des Ports


### Aktivieren des Ingress Addons (Gibt Fehlermeldung)
- Verwenden des Befhels: `minikube addons enable ingress` -> Funktioniert nur bei Linux
- `minikube tunnel`
- `kubectl port-forward service/*`

## Befehle zum Managen des Clusters
Kommandos: https://minikube.sigs.k8s.io/docs/start/
- `kubectl get all`
- `kubectl get ingress`
- `kubectl describe service/popular-slides-service`