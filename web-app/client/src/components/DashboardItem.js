import React from "react";

function DashboardItem(props) {
  const { description, value } = props;

  return (
    <div className="col-6 col-xl-3">
      <div className="card p-15 shadow">
        <div className="text-center font-size-24 font-weight-bold">{value}</div>
        <div className="text-center font-size-16">{description}</div>
      </div>
    </div>
  );
}

export default DashboardItem;
