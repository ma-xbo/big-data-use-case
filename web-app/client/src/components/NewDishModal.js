import React, { useState, useEffect } from "react";
import classNames from "classnames";
import CustomModal from "../components/CustomModal";

function NewDishModal(props) {
  const { isOpen, onClose } = props;
  const [dishName, setDishName] = useState("");
  const [dishNameError, setDishNameError] = useState("");
  const [dishPrice, setDishPrice] = useState(0.0);
  const [dishPriceError, setDishPriceError] = useState("");

  useEffect(() => {
    if (dishName !== "") {
      setDishNameError("");
    } else {
      switch (dishName) {
        case "":
          setDishNameError("Bitte geben Sie einen Namen für das Gericht ein.");
          break;
        default:
          setDishNameError("Es ist ein unbekannter Fehler aufgetreten.");
      }
    }
  }, [dishName]);

  useEffect(() => {
    const regex = new RegExp(/\d*(?:.\d{2})$/);
    if (regex.test(dishPrice)) {
      setDishPriceError("");
    } else {
      setDishPriceError("Die Eingabe muss im folgenden Format vorliegen: 129.99");
    }
  }, [dishPrice]);

  async function postNewDish() {
    const data = { dish_name: dishName, dish_price: Number(dishPrice) };
    console.log(data);
    onClose();
    setDishName("");
    setDishPrice(0.0);
  }

  return (
    <CustomModal title="Neues Gericht" isOpen={isOpen}>
      <form>
        <div className="form-row">
          <div className="col-lg">
            <label htmlFor="dish-name" className="required">
              Name des Gerichts
            </label>
            {dishNameError !== "" && <div className="invalid-feedback">{dishNameError}</div>}
            <input
              type="text"
              className="form-control"
              id="dish-name"
              placeholder="Name des Gerichts"
              required="required"
              value={dishName}
              onChange={(event) => setDishName(event.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="col-lg">
            <label htmlFor="dish-price" className="required">
              Preis des Gerichts
            </label>
            {dishPriceError !== "" && <div className="invalid-feedback">{dishPriceError}</div>}
            <input
              type="text"
              className="form-control"
              id="dish-price"
              placeholder="Preis in Euro"
              required="required"
              value={dishPrice}
              onChange={(event) => setDishPrice(event.target.value)}
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
            "disabled ": !(dishPriceError === "" && dishNameError === ""),
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

export default NewDishModal;
