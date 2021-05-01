import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import ViewContainer from "../components/ViewContainer";

function OrderDetailsView(props) {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState();

  useEffect(() => {
    async function fetchData() {
      const url = "http://localhost:5000/api/order/" + order_id;
      await fetch(url)
        .then((response) => response.json())
        .then((data) => setOrderDetails(data));
    }
    fetchData();
  }, []);

  return (
    <ViewContainer title="Details der Bestellung">
      {orderDetails && (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-xl-6">
              <div>{order_id}</div>
              <div>{orderDetails.dish_name}</div>
            </div>
            <div className="col-12 col-xl-6">
              <MapContainer
                center={[orderDetails.store_lat, orderDetails.store_lon]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "300px" }}
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
