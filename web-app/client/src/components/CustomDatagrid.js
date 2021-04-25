import React, { useState, useEffect } from "react";
import DataGrid from "react-data-grid";

function ViewContainer(props) {
  const [darkModeOn, setDarkModeOn] = useState();

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        document.body.classList.contains("dark-mode") ? setDarkModeOn(true) : setDarkModeOn(false);
      }
    }
  };

  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
    childList: false,
    characterData: false,
  });

  return (
    <DataGrid
      columns={props.columns}
      rows={props.rows}
      className={darkModeOn ? "bg-dark" : "bg-light"}
      rowClass={(row) => (darkModeOn ? "bg-dark text-light" : "bg-light text-dark")}
    />
  );
}

export default ViewContainer;
