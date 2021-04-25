import React from "react";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItemText from "../components/DashboardItemText";
import DashboardItemContent from "../components/DashboardItemContent";

function MainView() {
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
            <p class="mx-5" id="p_status"></p>
            <button id="button_refreshStatus" class="btn btn-square" type="button">
              <i class="ri-refresh-line"></i>
            </button>
          </span>
          <span className="w-full d-flex flex-row align-items-center justify-content-around">
            <button class="btn btn-primary btn-rounded btn-lg" type="button">
              Start
            </button>
            <button class="btn btn-danger btn-rounded btn-lg" type="button">
              Stop
            </button>
          </span>
        </DashboardItemContent>

        <DashboardItemContent title='Erstellen von "Burst" Events'>
          <button class="btn btn-primary btn-rounded my-5" type="button">
            Sende 1x Kafka Event
          </button>
          <button class="btn btn-primary btn-rounded my-5" type="button">
            Sende 10x Kafka Event
          </button>
          <button class="btn btn-primary btn-rounded my-5" type="button">
            Sende 100x Kafka Event
          </button>
        </DashboardItemContent>

        <DashboardItemContent title="Konfiguration des Data Generator">
          <form>
            <label for="input_eventsPerMinute" class="required">
              Anzahl der durschnittlichen Events pro Minute
            </label>
            <div class="form-row row-eq-spacing">
              <div class="col">
                <input
                  type="text"
                  id="input_eventsPerMinute"
                  class="form-control"
                  placeholder="Events pro Minute"
                  pattern="[0-9]*"
                  inputmode="numeric"
                  required="required"
                />
                <div class="invalid-feedback d-none" id="error_inputEventsPerMin">
                  <ul>
                    <li>Das Feld muss eine Zahl enthalten</li>
                    <li>Die Zahl muss größer 0 sein</li>
                  </ul>
                </div>
                <div class="invalid-feedback d-none" id="error_dataGeneratorRunning">
                  <ul>
                    <li>Zum Ändern des Werts muss der Data Generator gestoppt werden</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="text-right">
              <input type="button" id="button_saveConfig" class="btn btn-primary" value="Speichern" />
            </div>
          </form>
        </DashboardItemContent>
      </DashboardContainer>

      
    </ViewContainer>
  );
}

export default MainView;
