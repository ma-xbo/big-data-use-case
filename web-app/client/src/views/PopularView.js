import React, { useState, useEffect } from "react";
import classNames from "classnames";

import { ordersBasePath } from "../helper/config";
import { useInterval } from "../helper/customHooks";
import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";

function PopularView() {
  const [popularDishes, setPopularDishes] = useState([]);
  const [popularStores, setPopularStores] = useState([]);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(1);
  const [isRefreshActive, setIsRefreshActive] = useState(false);

  // Initial fetch of data
  useEffect(() => {
    fetchPopularDishes();
    fetchPopularStores();
  }, []);

  // Automatic, timebased fetch of data with custom hook
  useInterval(
    () => {
      fetchPopularDishes();
      fetchPopularStores();
    },
    isRefreshActive ? refreshIntervalSeconds * 1000 : null
  );

  async function fetchPopularDishes() {
    const maxDishes = 10;
    const url = ordersBasePath + "/api/popular/dishes/" + maxDishes;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const dishes = data.dishes;
        const isCached = data.cached;
        dishes.map((row) => {
          row.dish_price = row.dish_price.toFixed(2) + "€";
          row.revenue = (row.revenue / 100).toFixed(2) + "€";
          return row;
        });
        setPopularDishes(dishes);

        let alerText = "";
        isCached
          ? (alerText = "Die beliebtesten Gerichte wurden aus dem Cache geladen")
          : (alerText = "Die beliebtesten Gerichte wurden aus der Datenbank geladen");

        stickyAlert({
          title: "Beliebte Gerichte neu geladen 🍲",
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

  async function fetchPopularStores() {
    const maxStores = 10;
    const url = ordersBasePath + "/api/popular/stores/" + maxStores;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const stores = data.stores;
        const isCached = data.cached;
        stores.map((row) => {
          row.revenue = (row.revenue / 100).toFixed(2) + "€";
          return row;
        });
        setPopularStores(stores);

        let alerText = "";
        isCached
          ? (alerText = "Die beliebtesten Restaurants wurden aus dem Cache geladen")
          : (alerText = "Die beliebtesten Restaurants wurden aus der Datenbank geladen");

        stickyAlert({
          title: "Beliebte Restaurants neu geladen 🍽️",
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
    <ViewContainer title="Auswertung der Bestellungen">
      <div className="container-fluid">
        <span className="d-flex flex-row justify-content-between align-items-center bg-light-lm bg-very-dark-dm rounded px-10">
          <button
            className="btn d-flex flex-row justify-content-center align-items-center"
            type="button"
            onClick={() => {
              fetchPopularDishes();
              fetchPopularStores();
            }}
          >
            <i className="ri-refresh-line mr-5"></i>
            <p>Daten aktualisiern</p>
          </button>
          <span className="d-flex flex-row justify-content-between align-items-center">
            <p>Automatisches Aktualisiern der Daten:</p>
            <span
              className={classNames("badge", "badge-pill", "m-10", {
                "badge-primary ": isRefreshActive,
              })}
            >
              {isRefreshActive ? refreshIntervalSeconds + "sec" : "off"}
            </span>
            <div className="btn-group" role="group" aria-label="Automatische Aktualisierung der Daten">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setIsRefreshActive(false);
                }}
              >
                off
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setIsRefreshActive(true);
                  setRefreshIntervalSeconds(10);
                }}
              >
                10sec
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setIsRefreshActive(true);
                  setRefreshIntervalSeconds(30);
                }}
              >
                30sec
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setIsRefreshActive(true);
                  setRefreshIntervalSeconds(60);
                }}
              >
                1min
              </button>
            </div>
          </span>
        </span>
        <div className="row">
          <div className="col-12 col-xl-6 p-5">
            <h5>Auflistung der beliebtesten Gerichte</h5>
            {popularDishes.length ? (
              <CustomDatagrid columns={columnsPopularDishes} rows={popularDishes} />
            ) : (
              <div>Es sind keine Daten vorhanden</div>
            )}
          </div>
          <div className="col-12 col-xl-6 p-5">
            <h5>Auflistung der beliebtesten Restaurants</h5>
            {popularStores.length ? (
              <CustomDatagrid columns={columnsPopularStores} rows={popularStores} />
            ) : (
              <div>Es sind keine Daten vorhanden</div>
            )}
          </div>
        </div>
      </div>
    </ViewContainer>
  );
}

const columnsPopularDishes = [
  { key: "dish_name", name: "Name" },
  { key: "dish_price", name: "Preis" },
  { key: "count", name: "Anzahl" },
  { key: "revenue", name: "Umsatz" },
];

const columnsPopularStores = [
  { key: "store_name", name: "Name" },
  { key: "store_lat", name: "Latitude" },
  { key: "store_lon", name: "Longitude" },
  { key: "count", name: "Anzahl" },
  { key: "revenue", name: "Umsatz" },
];

export default PopularView;
