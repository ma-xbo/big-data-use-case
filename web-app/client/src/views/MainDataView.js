import React, { useState, useEffect } from "react";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";
import NewDishModal from "../components/NewDishModal";
import NewRestaurantModal from "../components/NewRestaurantModal";

function MainDataView() {
  const [dishes, setDishes] = useState([]);
  const [stores, setStores] = useState([]);
  const [isNewDishModalOpen, setIsNewDishModalOpen] = useState(false);
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);

  // Initial fetch of data
  useEffect(() => {
    fetchDishes();
    fetchStores();
  }, []);

  async function fetchDishes() {
    const url = "http://localhost:5000/api/maindata/dishes";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const dishes = data.dishes;
        const isCached = data.cached;
        dishes.map((row) => {
          row.dish_price = row.dish_price.toFixed(2) + "€";
          return row;
        });
        setDishes(dishes);

        let alerText = "";
        isCached
          ? (alerText = "Die angelegten Gerichte wurden aus dem Cache geladen")
          : (alerText = "Die angelegten Gerichte wurden aus der Datenbank geladen");

        stickyAlert({
          title: "Gerichte wurden geladen",
          content: alerText,
          dismissible: true,
          color: "success",
          timeShown: 3000,
        });
      })
      .catch((error) => {
        stickyAlert({
          title: "Fehler aufgetreten",
          content: error,
          dismissible: true,
          color: "danger",
          timeShown: 5000,
        });
      });
  }

  async function fetchStores() {
    const url = "http://localhost:5000/api/maindata/stores";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const stores = data.stores;
        const isCached = data.cached;
        setStores(stores);

        let alerText = "";
        isCached
          ? (alerText = "Die angelegten Restaurants wurden aus dem Cache geladen")
          : (alerText = "Die angelegten Restaurants wurden aus der Datenbank geladen");

        stickyAlert({
          title: "Restaurants wurden geladen",
          content: alerText,
          dismissible: true,
          color: "success",
          timeShown: 3000,
        });
      })
      .catch((error) => {
        stickyAlert({
          title: "Fehler aufgetreten",
          content: error,
          dismissible: true,
          color: "danger",
          timeShown: 5000,
        });
      });
  }

  return (
    <ViewContainer title="Übersicht der Stammdaten">
      <NewDishModal isOpen={isNewDishModalOpen} onClose={() => setIsNewDishModalOpen(false)} />
      <NewRestaurantModal isOpen={isNewStoreModalOpen} onClose={() => setIsNewStoreModalOpen(false)} />
      <DashboardContainer>
        <DashboardItem description="Anzahl Gerichte" value={dishes.length} />
        <DashboardItem description="Anzahl Restaurants" value={stores.length} />
      </DashboardContainer>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-xl-6 pr-5">
            <h5>Auflistung der angelegten Gerichte</h5>
            <span className="d-flex flex-row justify-content-start align-items-center my-10">
              <button className="btn btn-square mr-5" type="button" onClick={fetchDishes}>
                <i className="ri-refresh-line"></i>
              </button>
              <button
                className="btn btn-primary d-flex flex-row justify-content-center align-items-center"
                type="button"
                onClick={() => setIsNewDishModalOpen(true)}
              >
                <i className="ri-add-circle-line mr-5"></i>
                <p>Gericht hinzufügen</p>
              </button>
            </span>
            {dishes.length ? (
              <CustomDatagrid columns={columnsDishes} rows={dishes} />
            ) : (
              <div>Es sind keine Daten vorhanden</div>
            )}
          </div>
          <div className="col-12 col-xl-6 pl-5">
            <h5>Auflistung der angelegten Restaurants</h5>
            <span className="d-flex flex-row justify-content-start align-items-center my-10">
              <button className="btn btn-square mr-5" type="button" onClick={fetchStores}>
                <i className="ri-refresh-line"></i>
              </button>
              <button
                className="btn btn-primary d-flex flex-row justify-content-center align-items-center"
                type="button"
                onClick={() => setIsNewStoreModalOpen(true)}
              >
                <i className="ri-add-circle-line mr-5"></i>
                <p>Restaurant hinzufügen</p>
              </button>
            </span>
            {stores.length ? (
              <CustomDatagrid columns={columnsStores} rows={stores} />
            ) : (
              <div>Es sind keine Daten vorhanden</div>
            )}
          </div>
        </div>
      </div>
    </ViewContainer>
  );
}

const columnsDishes = [
  { key: "dish_id", name: "ID" },
  { key: "dish_name", name: "Name" },
  { key: "dish_price", name: "Preis" },
];

const columnsStores = [
  { key: "store_id", name: "ID" },
  { key: "store_name", name: "Name" },
  { key: "store_lat", name: "Latitude" },
  { key: "store_lon", name: "Longitude" },
];

export default MainDataView;
