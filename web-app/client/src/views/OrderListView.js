import React, { useState, useEffect } from "react";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";
import DashboardContainer from "../components/DashboardContainer";
import DashboardItem from "../components/DashboardItem";
import CustomDatagrid from "../components/CustomDatagrid";

function OrderListView() {
  const [data, setData] = useState();

  // fetch orders
  useEffect(() => {
    async function fetchData() {
      const url = "http://localhost:5000/api/orders";
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          data.map((row) => {
            row.dish_price = row.dish_price.toFixed(2) + "€";
            row.timestamp = new Date(row.timestamp).toLocaleString();
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
    fetchData();
  }, []);

  return (
    <ViewContainer title="Übersicht der Bestellungen">
      {data && (
        <div className="container-fluid">
          <DashboardContainer>
            <DashboardItem description="Anzahl Bestellungen" value={data.length} />
            <DashboardItem description="Durchschnittlicher Preis" value={data.length} />
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
