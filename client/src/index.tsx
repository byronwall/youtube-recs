import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap/dist/css/bootstrap.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";

import { App } from "./App";
import { unregister } from "./registerServiceWorker";

unregister();

// import Bootstrap
const mainComp = (
  <HashRouter>
    <Route component={App} path={"/"} />
  </HashRouter>
);

ReactDOM.render(mainComp, document.getElementById("root") as HTMLElement);
