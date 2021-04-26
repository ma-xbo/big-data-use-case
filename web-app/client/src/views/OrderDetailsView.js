import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewContainer from "../components/ViewContainer";

function OrderDetailsView(props) {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState();

  console.log(order_id);
  // fetch orders6
  useEffect(async () => {
    const url = "http://localhost:5000/api/orders";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setOrderDetails(data));
  }, []);

  return (
    <ViewContainer title="Details der Bestellung">
      {orderDetails && <div>{order_id}</div>}
      {!orderDetails && <p>Keine Daten vorhanden</p>}
    </ViewContainer>
  );
}

export default OrderDetailsView;
