import React from "react";

function DashboardItemText(props) {
  const { title, text } = props;

  return (
    <div className="col-6 col-xl-3 align-items-stretch">
      <div className="card">
        <h2 className="card-title">{title}</h2>
        <div>{text}</div>
      </div>
    </div>
  );
}

export default DashboardItemText;