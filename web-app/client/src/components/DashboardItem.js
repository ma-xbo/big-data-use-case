import React from "react";

function DashboardItem(props) {
  const { title, text } = props;

  return (
    <div class="col-6 col-xl-3">
      <div class="card">
        <h2 class="card-title">{title}</h2>
        <div>{text}</div>
      </div>
    </div>
  );
}

export default DashboardItem;
