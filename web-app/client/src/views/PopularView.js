import React, { useState, useEffect } from "react";

import ViewContainer from "../components/ViewContainer";

function PopularView() {
  return (
    <ViewContainer title="Auswertung der Bestellungen">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-xl-6 p-5">
            <h5>Beliebte Gerichte</h5>
          </div>
          <div className="col-12 col-xl-6 p-5">
            <h5>Beliebte Restaurants</h5>
          </div>
        </div>
      </div>
    </ViewContainer>
  );
}

export default PopularView;
