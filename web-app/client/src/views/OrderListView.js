import React, { useState, useEffect } from "react";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";
import CustomPagination from "../components/CustomPagination";

function OrderListView() {
  const [data, setData] = useState();
  const [orderCount, setOrderCountData] = useState(0);
  const [avgDishPrice, setAvgDishPrice] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  // Laden der Daten beim Aufrufen der Ansicht
  useEffect(() => {
    fetchOrders();
    fetchOrderStatistics();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  // Laden der Bestellungen
  async function fetchOrders() {
    const url = "http://localhost:5000/api/orders/page/" + currentPage + "/limit/" + ordersPerPage;
    console.log(url);
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const orders = data.orders;

        orders.map((row) => {
          row.dish_price = row.dish_price.toFixed(2) + "€";
          row.timestamp = new Date(row.timestamp).toLocaleString("de-DE", dateOptions);
        });

        setData(orders);

        const alertText = "Die Bestellungen der Seite" + currentPage + " wurden geladen";
        stickyAlert({
          title: "Gerichte geladen",
          content: alertText,
          dismissible: true,
          color: "success",
          timeShown: 2000,
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
        avgDishPrice ? setAvgDishPrice(avgDishPrice.toFixed(2)) : setAvgDishPrice(0);

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
          <CustomPagination
            currentPage={currentPage}
            maxPage={Math.ceil(orderCount / ordersPerPage)}
            nextPage={(page) => setCurrentPage(page)}
            prevPage={(page) => setCurrentPage(page)}
          />
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

export default OrderListView;
