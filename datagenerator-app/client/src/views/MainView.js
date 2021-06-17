import React, { useState, useEffect } from "react";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItemText from "../components/DashboardItemText";
import DashboardItemContent from "../components/DashboardItemContent";

function MainView() {
  const [serviceRunning, setServiceRunning] = useState();
  const [eventsPerMinute, setEventsPerMinute] = useState(30);
  const [dataArray, setDataArray] = useState([]);
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  // Initialen Status prüfen
  useEffect(() => {
    checkServiceRunning();
    getDataGeneratorConfig();
    wsData();
  }, []);

  const simulatorBasePath = window.location.protocol + "//" + window.location.host + "/simulator";

  // ------------------------------------------------------------
  // Funktionen
  // ------------------------------------------------------------

  function wsData() {
    const ws = new WebSocket("ws://" + window.location.host + "/simulator/api/orders/socket");
    // websocket -> Aufbau der Verbindung
    ws.onopen = () => {
      console.log("connected websocket main component");
    };

    // websocket -> Empfangen einer Nachricht
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDataArray((oldArray) => [...oldArray, data]);
    };
  }

  async function checkServiceRunning() {
    const url = simulatorBasePath + "/api/service/status";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setServiceRunning(data.running));
  }

  async function startDataGenerator() {
    const url = simulatorBasePath + "/api/service/start";
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
    const url = simulatorBasePath + "/api/service/stop";
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
    const url = simulatorBasePath + "/api/service/config";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setEventsPerMinute((60 / data.sleepTimeMilliseconds) * 1000));
  }

  async function postDataGeneratorConfig() {
    if (Number(eventsPerMinute) > 0) {
      const data = { eventsPerMinute: eventsPerMinute };

      // Post-Request zum Ändern der Daten des Data Generator
      const url = simulatorBasePath + "/api/service/config";
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }
  }

  async function createBurstEvent() {
    const url = simulatorBasePath + "/api/orders/addorder";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        //setDataArray((oldArray) => [...oldArray, data]);
        //console.log(data);
      });
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

        <DashboardItemContent title='Erstellen von "Burst" Events'>
          <button className="btn btn-primary btn-rounded my-5" type="button" onClick={createBurstEvent}>
            1x Bestellung auslösen
          </button>
          <button
            className="btn btn-primary btn-rounded my-5"
            type="button"
            onClick={() => {
              for (let index = 0; index < 10; index++) {
                setTimeout(() => {
                  createBurstEvent();
                }, 50);
              }
            }}
          >
            10x Bestellung auslösen
          </button>
          <button
            className="btn btn-primary btn-rounded my-5"
            type="button"
            onClick={() => {
              for (let index = 0; index < 100; index++) {
                setTimeout(() => {
                  createBurstEvent();
                }, 50);
              }
            }}
          >
            100x Bestellung auslösen
          </button>
          <button
            className="btn btn-primary btn-rounded my-5"
            type="button"
            onClick={() => {
              const maxValue = Math.round(Math.random() * 100);
              for (let index = 0; index < maxValue; index++) {
                setTimeout(() => {
                  createBurstEvent();
                }, 50);
              }
            }}
          >
            Random Bestellung auslösen
          </button>
        </DashboardItemContent>
      </DashboardContainer>

      <div className="card p-15">
        <span className="d-flex align-items-start justify-content-between">
          <h2 className="card-title">Ausgabe der erstellten Events</h2>
          <span className="d-flex flex-row">
            <button
              className="btn btn-danger d-flex flex-row justify-content-center align-items-center"
              type="button"
              onClick={() => setDataArray([])}
            >
              <i className="ri-delete-bin-2-line mr-5"></i>
              <p>Liste leeren</p>
            </button>
            <button
              className="btn btn-square rounded-circle ml-20"
              type="button"
              onClick={() => setIsOutputVisible((state) => !state)}
            >
              {isOutputVisible ? (
                <i className="ri-arrow-drop-down-fill"></i>
              ) : (
                <i className="ri-arrow-drop-left-line"></i>
              )}
            </button>
          </span>
        </span>
        {isOutputVisible && (
          <div className="overflow-auto w-full h-400">
            {dataArray.map((item) => (
              <span className="d-flex flex-row justify-content-start align-items-center">
                <i className="ri-profile-line"></i>
                <p>{item.order_id}</p>
                <i className="ri-restaurant-2-line ml-10"></i>
                <p>{item.dish_name}</p>
                <i className="ri-store-3-fill ml-10"></i>
                <p>{item.store_name}</p>
                <i className="ri-time-line ml-10"></i>
                <p>{new Date(item.timestamp * 1000).toLocaleString("de-DE", dateOptions)}</p>
              </span>
            ))}
          </div>
        )}
      </div>
    </ViewContainer>
  );
}

const dateOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

export default MainView;
