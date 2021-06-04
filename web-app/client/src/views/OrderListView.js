import React, { useState, useEffect } from "react";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";

function OrderListView() {
  const [data, setData] = useState();
  const [orderCount, setOrderCountData] = useState();
  const [avgDishPrice, setAvgDishPrice] = useState();

  // Laden der Daten beim Aufrufen der Ansicht
  useEffect(() => {
    fetchOrders();
    fetchOrderStatistics();
  }, []);

  // Laden der Bestellungen
  async function fetchOrders() {
    const url = "http://localhost:5000/api/orders";
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        };

        data.map((row) => {
          row.dish_price = row.dish_price.toFixed(2) + "€";
          row.timestamp = new Date(row.timestamp).toLocaleString("de-DE", dateOptions);
        });
        setData(data);
        stickyAlert({
          title: "Gerichte geladen",
          content: "Die Liste der Bestellungen wurden geladen",
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

  // Laden der Statistiken zu den Bestellungen
  async function fetchOrderStatistics() {
    const url = "http://localhost:5000/api/orders/statistics";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const orderCount = data.orderCount;
        const avgDishPrice = data.avgDishPrice;
        setOrderCountData(orderCount);
        setAvgDishPrice(avgDishPrice.toFixed(2));

        let alerText = "Die Statistiken zu den Bestellungenwurden geladen";

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
    <ViewContainer title="Übersicht der Bestellungen">
      {data && (
        <div className="container-fluid">
          <DashboardContainer>
            <DashboardItem description="Anzahl Bestellungen" value={orderCount} />
            <DashboardItem description="Durchschnittlicher Preis" value={avgDishPrice + "€"} />
          </DashboardContainer>
          <CustomDatagrid columns={columns} rows={data} linkKey="dish_name" />
        </div>
      )}
      {!data && <p>Keine Daten vorhanden</p>}
    </ViewContainer>
  );
}

const columns = [
  { key: "dish_name", name: "Name" },
  { key: "dish_price", name: "Preis" },
  { key: "store_name", name: "Geschäft" },
  { key: "timestamp", name: "Zeitpunkt" },
];

export default OrderListView;
