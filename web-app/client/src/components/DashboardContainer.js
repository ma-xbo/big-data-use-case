import React from "react";

function DashboardContainer(props) {
  return (
    <div className="container-fluid">
      <div className="row row-eq-spacing">{props.children}</div>
    </div>
  );
}

export default DashboardContainer;
