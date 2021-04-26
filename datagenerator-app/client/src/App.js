import React from "react";
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from "react-router-dom";

//import "./App.css";
import "halfmoon/css/halfmoon-variables.min.css";
import "remixicon/fonts/remixicon.css";

import MainView from "./views/MainView";

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
              <i className="ri-bubble-chart-line mr-5"></i>
              <span>Data Generator</span>
            </Link>
            <ul className="navbar-nav d-none d-md-flex">
              <li className="nav-item">
                <Link className="nav-link" to="/overview">
                  Übersicht
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
                <Redirect to="/overview" />
              </Route>
              <Route path="/overview">
                <MainView />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
