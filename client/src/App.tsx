import { Videos } from "./Videos";
import * as React from "react";
import { Header } from "./Header";

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <Header />
        <Videos />
      </div>
    );
  }
}
