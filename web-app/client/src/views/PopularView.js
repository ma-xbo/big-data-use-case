import React, { useState, useEffect } from "react";
import classNames from "classnames";

import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";

function PopularView() {
  const [popularDishes, setPopularDishes] = useState();
  const [popularStores, setPopularStores] = useState();
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(1);
  const [refreshActive, setRefreshActive] = useState(false);
  let timer = null;

  // Initial fetch of data
  useEffect(() => {
    setPopularDishes(dummyPopularDishes);
    setPopularStores(dummyPopularStores);

    // component unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    console.log("active changed");
    if (refreshActive) {
      clearInterval(timer);
      timer = setInterval(test, refreshIntervalSeconds * 1000);
    } else {
      clearInterval(timer);
      timer=null;
    }
  }, [refreshActive]);

  useEffect(() => {
    console.log("change timer value");
    if (refreshActive) {
      clearInterval(timer);
      timer = setInterval(test, refreshIntervalSeconds * 1000);
    } else {
      clearInterval(timer);
    }
  }, [refreshIntervalSeconds]);

  async function fetchPopularDishes() {
    const maxDishes = 10;
    const url = "http://localhost:5000/api/popular/dishes/" + maxDishes;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        data.map((row) => {
          row.dish_price = row.dish_price.toFixed(2) + "€";
        });
        setPopularDishes(data);
      });
  }

  function test() {
    console.log("Timer tick");
  }

  return (
    <ViewContainer title="Auswertung der Bestellungen">
      <div className="container-fluid">
        <div className="row">
          <DashboardContainer>
            {popularDishes && <DashboardItem description="Anzahl Bestellungen" value={popularDishes.length} />}
          </DashboardContainer>
        </div>
        <span className="d-flex flex-row justify-content-between align-items-center bg-light-lm bg-very-dark-dm rounded px-10">
          <button
            className="btn d-flex flex-row justify-content-center align-items-center"
            type="button"
            onClick={() => {
              console.log("manual reload");
            }}
          >
            <i className="ri-refresh-line mr-5"></i>
            <p>Daten aktualisiern</p>
          </button>
          <span className="d-flex flex-row justify-content-between align-items-center">
            <p>Automatisches Aktualisiern der Daten:</p>
            <span
              className={classNames("badge", "badge-pill", "m-10", {
                "badge-primary ": refreshActive,
              })}
            >
              {refreshActive ? refreshIntervalSeconds + "sec" : "off"}
            </span>
            <div className="btn-group" role="group" aria-label="Automatische Aktualisierung der Daten">
              <button
                className="btn disabled"
                type="button"
                onClick={() => {
                  setRefreshActive(false);
                  setRefreshIntervalSeconds(1);
                }}
              >
                off
              </button>
              <button
                className="btn disabled"
                type="button"
                onClick={() => {
                  setRefreshActive(true);
                  setRefreshIntervalSeconds(1);
                }}
              >
                1sec
              </button>
              <button
                className="btn disabled"
                type="button"
                onClick={() => {
                  setRefreshActive(true);
                  setRefreshIntervalSeconds(5);
                }}
              >
                5sec
              </button>
              <button
                className="btn disabled"
                type="button"
                onClick={() => {
                  setRefreshActive(true);
                  setRefreshIntervalSeconds(10);
                }}
              >
                10sec
              </button>
            </div>
          </span>
        </span>
        <div className="row">
          <div className="col-12 col-xl-6 p-5">
            <h5>Beliebteste Gerichte</h5>
            <CustomDatagrid columns={columnsPopularDishes} rows={popularDishes} />
          </div>
          <div className="col-12 col-xl-6 p-5">
            <h5>Beliebteste Restaurants</h5>
            <CustomDatagrid columns={columnsPopularStores} rows={popularStores} />
          </div>
        </div>
      </div>
    </ViewContainer>
  );
}

const columnsPopularDishes = [
  { key: "dish_id", name: "ID" },
  { key: "dish_name", name: "Name" },
  { key: "dish_price", name: "Preis" },
  { key: "count", name: "Anzahl" },
];
const dummyPopularDishes = [
  { dish_id: "jshad", dish_name: "Test1", dish_price: 13.7, count: 23 },
  { dish_id: "sjkak", dish_name: "Test2", dish_price: 14.7, count: 20 },
  { dish_id: "qiuwz", dish_name: "Test3", dish_price: 11.23, count: 17 },
  { dish_id: "sadda", dish_name: "Test4", dish_price: 12.2, count: 13 },
  { dish_id: "lklaa", dish_name: "Test5", dish_price: 9.25, count: 12 },
  { dish_id: "jnasj", dish_name: "Test6", dish_price: 18.7, count: 9 },
];

const columnsPopularStores = [
  { key: "store_id", name: "ID" },
  { key: "store_name", name: "Name" },
  { key: "store_lat", name: "Latitude" },
  { key: "store_lon", name: "Longitude" },
  { key: "count", name: "Anzahl" },
];
const dummyPopularStores = [
  { store_id: "jshad", store_name: "Test1", store_lat: 13.7, store_lon: 13.7, count: 23 },
  { store_id: "sjkak", store_name: "Test2", store_lat: 14.7, store_lon: 14.7, count: 20 },
  { store_id: "qiuwz", store_name: "Test3", store_lat: 11.23, store_lon: 11.23, count: 17 },
  { store_id: "sadda", store_name: "Test4", store_lat: 12.2, store_lon: 12.2, count: 13 },
  { store_id: "lklaa", store_name: "Test5", store_lat: 9.25, store_lon: 9.25, count: 12 },
  { store_id: "jnasj", store_name: "Test6", store_lat: 18.7, store_lon: 18.7, count: 9 },
];

export default PopularView;
