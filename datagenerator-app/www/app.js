window.addEventListener("load", (evt) => {
  let dataGeneratorRunning = false;

  refreshConfig();

  document.getElementById("button_toggleDarkMode").addEventListener("click", toggleDarkMode);
  document.getElementById("button_refreshStatus").addEventListener("click", refreshStatus);
  document.getElementById("button_startGenerator").addEventListener("click", startDataGenerator);
  document.getElementById("button_stopGenerator").addEventListener("click", stopDataGenerator);
  document.getElementById("button_saveConfig").addEventListener("click", overrideConfig);
  document.getElementById("button_sendKafkaEvents1").addEventListener("click", sendKafkaEvents_1);
  document.getElementById("button_sendKafkaEvents10").addEventListener("click", sendKafkaEvents_10);
  document.getElementById("button_sendKafkaEvents100").addEventListener("click", sendKafkaEvents_100);

  function toggleDarkMode() {
    halfmoon.toggleDarkMode();
  }

  function refreshStatus() {
    const url = "http://localhost:3000/api/config";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        dataGeneratorRunning = data.running;
        const elementText = data.running ? "running" : "not running";
        document.getElementById("p_status").innerText = elementText;
      });
  }

  function refreshConfig() {
    const url = "http://localhost:3000/api/config";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        dataGeneratorRunning = data.running;
        const statusText = data.running ? "running" : "not running";
        document.getElementById("p_status").innerText = statusText;

        const eventsPerMinuteText = (60 / data.sleepTimeMilliseconds) * 1000;
        document.getElementById("input_eventsPerMinute").value = eventsPerMinuteText.toFixed(0);
      });
  }

  function overrideConfig() {
    const element_errRunning = document.getElementById("error_dataGeneratorRunning");
    const element_errPattern = document.getElementById("error_inputEventsPerMin");

    const eventsPerMinuteText = document.getElementById("input_eventsPerMinute").value;

    if (dataGeneratorRunning) {
      const alertContent =
        "Der Data Generator läuft gerade. Um die Konfiguration zu Ändern müssen Sie Ihn zu erst stoppen.";
      halfmoon.initStickyAlert({
        content: alertContent,
        title: "Fehler",
        alertType: "alert-danger",
        fillType: "",
        hasDismissButton: true,
        timeShown: 5000,
      });

      // Anzeigen der Fehlermeldung
      if (element_errRunning.classList.contains("d-none")) {
        element_errRunning.classList.remove("d-none");
      }
    } else {
      // Verstecken der Fehlermeldung
      if (!element_errRunning.classList.contains("d-none")) {
        element_errRunning.classList.add("d-none");
      }

      if (Number(eventsPerMinuteText) > 0) {
        // Verstecken der Fehlermeldung
        if (!element_errPattern.classList.contains("d-none")) {
          element_errPattern.classList.add("d-none");
        }

        const data = { eventsPerMinute: eventsPerMinuteText };

        // Post-Request zum Ändern der Daten des Data Generator
        const url = "http://localhost:3000/api/config";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        const alertContent = "Bitte geben Sie den Inhalt in dem vorgeschriebenen Format ein.";
        halfmoon.initStickyAlert({
          content: alertContent,
          title: "Fehler",
          alertType: "alert-danger",
          fillType: "",
          hasDismissButton: true,
          timeShown: 5000,
        });

        // Anzeigen der Fehlermeldung
        if (element_errPattern.classList.contains("d-none")) {
          element_errPattern.classList.remove("d-none");
        }
      }
    }

    // Darstellen der aktuellen Konfiguration - wird immer aufgerufen
    refreshConfig();
  }

  function startDataGenerator() {
    const url = "http://localhost:3000/api/start";
    fetch(url).then(refreshStatus());

    const alertText = "Der Data Generator wurde erfolgreich gestartet.";
    halfmoon.initStickyAlert({
      content: alertText,
      title: "Aktion erfolgreich",
      alertType: "alert-success",
      fillType: "",
      hasDismissButton: true,
      timeShown: 5000,
    });
  }

  function stopDataGenerator() {
    const url = "http://localhost:3000/api/stop";
    fetch(url).then(refreshStatus());

    const alertText = "Der Data Generator wurde erfolgreich gestoppt.";
    halfmoon.initStickyAlert({
      content: alertText,
      title: "Aktion erfolgreich",
      alertType: "alert-success",
      fillType: "",
      hasDismissButton: true,
      timeShown: 5000,
    });
  }

  function sendKafkaEvents_1() {
    const url = "http://localhost:3000/api/sendkafka";
    fetch(url).then((res) => console.log(res.status));
  }

  function sendKafkaEvents_10() {
    for(x=0; x<10; x++) sendKafkaEvents_1();
  }

  function sendKafkaEvents_100() {
    for(x=0; x<100; x++) sendKafkaEvents_1();
  }
});
