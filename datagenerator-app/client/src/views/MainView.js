import React, { useState, useEffect } from "react";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItemText from "../components/DashboardItemText";
import DashboardItemContent from "../components/DashboardItemContent";

function MainView() {
  const [serviceRunning, setServiceRunning] = useState();
  const [eventsPerMinute, setEventsPerMinute] = useState(30);

  // Initialen Status prüfen
  useEffect(() => {
    checkServiceRunning();
    getDataGeneratorConfig();
  }, []);

  // ------------------------------------------------------------
  // Funktionen
  // ------------------------------------------------------------

  async function checkServiceRunning() {
    const url = "http://localhost:3000/api/service/status";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setServiceRunning(data.running));
  }

  async function startDataGenerator() {
    const url = "http://localhost:3000/api/service/start";
    fetch(url).then(() => {
      const maxTries = 3;
      for (let index = 0; index < maxTries; index++) {
        if (serviceRunning === false) {
          checkServiceRunning();
        }
      }
    });
  }

  async function stopDataGenerator() {
    const url = "http://localhost:3000/api/service/stop";
    fetch(url).then(() => {
      const maxTries = 3;
      for (let index = 0; index < maxTries; index++) {
        if (serviceRunning === true) {
          checkServiceRunning();
        }
      }
    });
  }

  async function getDataGeneratorConfig() {
    const url = "http://localhost:3000/api/service/config";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setEventsPerMinute((60 / data.sleepTimeMilliseconds) * 1000));
  }

  async function postDataGeneratorConfig() {
    if (Number(eventsPerMinute) > 0) {
      const data = { eventsPerMinute: eventsPerMinute };

      // Post-Request zum Ändern der Daten des Data Generator
      const url = "http://localhost:3000/api/service/config";
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }
  }

  // ------------------------------------------------------------
  // Return
  // ------------------------------------------------------------
  return (
    <ViewContainer title="Übersicht des Data Generator">
      <p>
        Nachfolgend werden alle Informationen zum aktuellen Status des Data Generators, dessen Konfiguration und
        Kommandos aufgeführt. Über die Schaltflächen kann die automatisierte Erstellung von Bestellungen gestartet bzw.
        gestoppt werden.
      </p>

      <DashboardContainer>
        <DashboardItemText title="Dummy" text="Test" />
        <DashboardItemContent title="Status des Data Generator">
          <span className="d-flex flex-row align-items-center">
            <p>Aktueller Status:</p>
            {serviceRunning && <p className="mx-5">Aktiv</p>}
            {!serviceRunning && <p className="mx-5">Nicht aktiv</p>}
            <button className="btn btn-square" type="button" onClick={checkServiceRunning}>
              <i className="ri-refresh-line"></i>
            </button>
          </span>
          <span className="w-full d-flex flex-row align-items-center justify-content-around">
            <button className="btn btn-primary btn-rounded btn-lg" type="button" onClick={startDataGenerator}>
              Start
            </button>
            <button className="btn btn-danger btn-rounded btn-lg" type="button" onClick={stopDataGenerator}>
              Stop
            </button>
          </span>
        </DashboardItemContent>

        <DashboardItemContent title='Erstellen von "Burst" Events'>
          <button className="btn btn-primary btn-rounded my-5" type="button">
            Sende 1x Kafka Event
          </button>
          <button className="btn btn-primary btn-rounded my-5" type="button">
            Sende 10x Kafka Event
          </button>
          <button className="btn btn-primary btn-rounded my-5" type="button">
            Sende 100x Kafka Event
          </button>
        </DashboardItemContent>

        <DashboardItemContent title="Konfiguration des Data Generator">
          <form>
            <label htmlFor="input_eventsPerMinute" className="required">
              Anzahl der durschnittlichen Events pro Minute
            </label>
            <div className="form-row row-eq-spacing">
              <div className="col">
                <input
                  type="text"
                  value={eventsPerMinute}
                  onChange={(e) => {
                    const re = /^[0-9\b]+$/;
                    if (e.target.value === "" || re.test(e.target.value)) {
                      setEventsPerMinute(e.target.value);
                    }
                  }}
                  className="form-control"
                  placeholder="Events pro Minute"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required="required"
                />
                {eventsPerMinute <= 0 && (
                  <div className="invalid-feedback">
                    <ul>
                      <li>Das Feld muss eine Zahl enthalten</li>
                      <li>Die Zahl muss größer 0 sein</li>
                    </ul>
                  </div>
                )}
                {serviceRunning && (
                  <div className="invalid-feedback">
                    <ul>
                      <li>Zum Ändern des Werts muss der Data Generator gestoppt werden</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <input type="button" className="btn btn-primary" value="Speichern" onClick={postDataGeneratorConfig} />
            </div>
          </form>
        </DashboardItemContent>
      </DashboardContainer>
    </ViewContainer>
  );
}

export default MainView;
