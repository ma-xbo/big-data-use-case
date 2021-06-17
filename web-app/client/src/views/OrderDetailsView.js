import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { ordersBasePath } from "../helper/config";
import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";

function OrderDetailsView(props) {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState();

  useEffect(() => {
    fetchOrderData();
  }, []);

  async function fetchOrderData() {
    const url = ordersBasePath + "/api/order/" + order_id;
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

        data.dish_price = data.dish_price.toFixed(2) + "€";
        data.timestamp = new Date(data.timestamp).toLocaleString("de-DE", dateOptions);
        setOrderDetails(data);

        stickyAlert({
          title: "Informationen geladen",
          content: "Die Details zu der Bestellung wurden geladen",
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
    <ViewContainer title="Details der Bestellung">
      {orderDetails && (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-xl-6 pr-5">
              <table className="table table-hover">
                <tbody>
                  {Object.keys(orderDetails).map((orderKey) => (
                    <tr>
                      <th>{nameKeys.find(({ key }) => key === orderKey).name}</th>
                      <td>{orderDetails[orderKey]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-12 col-xl-6 pl-5" style={{ zIndex: 1 }}>
              <MapContainer
                center={[orderDetails.store_lat, orderDetails.store_lon]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "500px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[orderDetails.store_lat, orderDetails.store_lon]}>
                  <Popup>{orderDetails.store_name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {!orderDetails && <p>Keine Daten vorhanden</p>}
    </ViewContainer>
  );
}

const nameKeys = [
  { key: "order_id", name: "Bestellnummer" },
  { key: "dish_name", name: "Gericht" },
  { key: "dish_price", name: "Preis" },
  { key: "store_name", name: "Geschäft" },
  { key: "store_area", name: "Zone" },
  { key: "store_lat", name: "Latitude" },
  { key: "store_lon", name: "Longitude" },
  { key: "timestamp", name: "Zeitpunkt" },
];

export default OrderDetailsView;
