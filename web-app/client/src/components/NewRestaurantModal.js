import React, { useState, useEffect } from "react";
import classNames from "classnames";
import CustomModal from "./CustomModal";

function NewRestaurantModal(props) {
  const { isOpen, onClose } = props;
  const [storeName, setStoreName] = useState("");
  const [storeNameError, setStoreNameError] = useState("");
  const [storeLat, setStoreLat] = useState(0.0);
  const [storeLatError, setStoreLatError] = useState("");
  const [storeLon, setStoreLon] = useState(0.0);
  const [storeLonError, setStoreLonError] = useState("");

  useEffect(() => {
    if (storeName !== "") {
      setStoreNameError("");
    } else {
      switch (storeName) {
        case "":
          setStoreNameError("Bitte geben Sie einen Namen für das Restaurant ein.");
          break;
        default:
          setStoreNameError("Es ist ein unbekannter Fehler aufgetreten.");
      }
    }
  }, [storeName]);

  useEffect(() => {
    const regex = new RegExp(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/);
    if (regex.test(storeLat)) {
      setStoreLatError("");
    } else {
      setStoreLatError("Die Eingabe muss im folgenden Format vorliegen: 46.21921349 und zwischen -90 und +90 liegen");
    }
  }, [storeLat]);

  useEffect(() => {
    const regex = new RegExp(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
    if (regex.test(storeLon)) {
      setStoreLonError("");
    } else {
      setStoreLonError(
        "Die Eingabe muss im folgenden Format vorliegen: 120.21921349 und zwischen -180 und +180 liegen"
      );
    }
  }, [storeLon]);

  async function postNewDish() {
    const data = { store_name: storeName, store_lat: storeLat, store_lon: storeLon };
    console.log(data);
    onClose();
    setStoreName("");
    setStoreLat(0.0);
    setStoreLon(0.0);
  }

  return (
    <CustomModal title="Neues Restaurant anlegen" isOpen={isOpen}>
      <form>
        <div className="form-row">
          <div className="col-lg">
            <label htmlFor="store-name" className="required">
              Name des Restaurants
            </label>
            {storeNameError !== "" && <div className="invalid-feedback">{storeNameError}</div>}
            <input
              type="text"
              className="form-control"
              id="store-name"
              placeholder="Name des Restaurants"
              required="required"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
            />
          </div>
        </div>
        <div className="form-row row-eq-spacing">
          <div className="col">
            <label htmlFor="store-lat" className="required">
              Latitude
            </label>
            {storeLatError !== "" && <div className="invalid-feedback">{storeLatError}</div>}
            <input
              type="text"
              className="form-control"
              id="store-lat"
              placeholder="Latitude"
              required="required"
              value={storeLat}
              onChange={(event) => setStoreLat(event.target.value)}
            />
          </div>
          <div className="col">
            <label htmlFor="store-lot" className="required">
              Longitude
            </label>
            {storeLonError !== "" && <div className="invalid-feedback">{storeLonError}</div>}
            <input
              type="text"
              className="form-control"
              id="store-lot"
              placeholder="Latitude"
              required="required"
              value={storeLon}
              onChange={(event) => setStoreLon(event.target.value)}
            />
          </div>
        </div>
      </form>
      <span className="d-flex flex-row justify-content-between align-items-center">
        <button className="btn" type="button" onClick={onClose}>
          Abbrechen
        </button>
        <button
          className={classNames("btn", "btn-primary", {
            "disabled ": !(storeNameError === "" && storeLonError === "" && storeLatError === ""),
          })}
          type="button"
          onClick={postNewDish}
        >
          Speichern
        </button>
      </span>
    </CustomModal>
  );
}

export default NewRestaurantModal;
