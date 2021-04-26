import React from "react";

function DashboardItemText(props) {
  const { title, children } = props;

  return (
    <div className="col-6 col-xl-3">
      <div className="card p-15">
        <h2 className="card-title">{title}</h2>
        <div className="d-flex flex-column align-items-center">{children}</div>
      </div>
    </div>
  );
}

export default DashboardItemText;
