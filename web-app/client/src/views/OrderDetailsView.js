import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { stickyAlert } from "../helper/stickyAlert";
import ViewContainer from "../components/ViewContainer";

function OrderDetailsView(props) {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState();

  useEffect(() => {
    async function fetchData() {
      const url = "http://localhost:5000/api/order/" + order_id;
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          data.dish_price = data.dish_price.toFixed(2) + "€";
          data.timestamp = new Date(data.timestamp).toLocaleString();
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
    fetchData();
  }, []);

  return (
    <ViewContainer title="Details der Bestellung">
      {orderDetails && (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-xl-6 pr-5">
              <table className="table table-hover">
                <tbody>
                  {Object.keys(orderDetails).map((key) => (
                    <tr>
                      <th>{key}</th>
                      <td>{orderDetails[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-12 col-xl-6 pl-5">
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

export default OrderDetailsView;
