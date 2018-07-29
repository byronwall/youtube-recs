import * as React from "react";
import { Route, Switch } from "react-router-dom";

import { Header } from "./Header";
import { RelatedVideos } from "./RelatedVideos";
import { Videos } from "./Videos";

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route path={"/related/:id"} component={RelatedVideos} />
          <Route path={"/"} component={Videos} />
        </Switch>
      </div>
    );
  }
}
