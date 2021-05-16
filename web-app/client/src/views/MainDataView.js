import React, { useState, useEffect } from "react";
import classNames from "classnames";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";

function MainDataView() {
  const [dishes, setDishes] = useState([]);
  const [stores, setStores] = useState([]);

  // Initial fetch of data
  useEffect(() => {
    fetchDishes();
  }, []);

  async function fetchDishes() {
    const maxDishes = 10;
    const url = "http://localhost:5000/api/popular/dishes/" + maxDishes; //TODO
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

  return (
    <ViewContainer title="Übersicht der Stammdaten">
      <DashboardContainer>
        <DashboardItem description="Anzahl Gerichte" value={dishes.length} />
        <DashboardItem description="Anzahl Restaurants" value={stores.length} />
      </DashboardContainer>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-xl-6 pr-5">
            <h5>Auflistung der angelegten Gerichte</h5>
            {dishes.length ? (
              <CustomDatagrid columns={columnsDishes} rows={dishes} />
            ) : (
              <div>Es sind keine Daten vorhanden</div>
            )}
          </div>
          <div className="col-12 col-xl-6 pl-5">
            <h5>Auflistung der angelegten Restaurants</h5>
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
  { key: "count", name: "Anzahl" },
];

const columnsStores = [
  { key: "store_id", name: "ID" },
  { key: "store_name", name: "Name" },
  { key: "store_lat", name: "Latitude" },
  { key: "store_lon", name: "Longitude" },
  { key: "count", name: "Anzahl" },
];

export default MainDataView;
