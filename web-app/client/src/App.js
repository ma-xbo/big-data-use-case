import React from "react";
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from "react-router-dom";

import "halfmoon/css/halfmoon-variables.min.css";
import "remixicon/fonts/remixicon.css";

import OrderListView from "./views/OrderListView";
import OrderDetailsView from "./views/OrderDetailsView";
import PopularView from "./views/PopularView";

function App() {
  // Import JS library
  const halfmoon = require("halfmoon");
  halfmoon.onDOMContentLoaded();

  return (
    <Router>
      <div className="App">
        <div className="page-wrapper with-navbar">
          <nav className="navbar">
            <Link className="navbar-brand" to="/">
              <i className="ri-restaurant-2-line mr-5"></i>
              <span>Bestellübersicht</span>
            </Link>
            <ul className="navbar-nav d-none d-md-flex">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Übersicht
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/popular">
                  Beliebt
                </Link>
              </li>
            </ul>
            <form className="form-inline d-none d-md-flex ml-auto">
              <button className="btn btn-square" type="button" onClick={() => halfmoon.toggleDarkMode()}>
                <i className="ri-moon-line"></i>
              </button>
            </form>
          </nav>

          <div className="content-wrapper">
            <Switch>
              <Route exact path="/">
                <Redirect to="/list" />
              </Route>
              <Route path="/list">
                <OrderListView />
              </Route>
              <Route path="/details/:order_id">
                <OrderDetailsView />
              </Route>
              <Route path="/popular">
                <PopularView />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
