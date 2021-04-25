import React, { useState, useEffect } from "react";
import ViewContainer from "../components/ViewContainer";
import CustomDatagrid from "../components/CustomDatagrid";

function ListView() {
  const [data, setData] = useState();

  // fetch orders
  useEffect(async () => {
    const url = "http://localhost:5000/api/orders";
    fetch(url)
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const columns = [
    { key: "order_id", name: "ID" },
    { key: "dish_name", name: "Name" },
    { key: "dish_price", name: "Preis" },
    { key: "store_name", name: "Geschäft" },
    { key: "timestamp", name: "Zeit" },
  ];

  return (
    <ViewContainer>
      <h1>List View</h1>
      {data && <CustomDatagrid columns={columns} rows={data} />}
    </ViewContainer>
  );
}

export default ListView;
