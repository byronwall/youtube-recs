import { Videos } from "./Videos";
import * as React from "react";

import getMuiTheme from "material-ui/styles/getMuiTheme";
import { MuiThemeProvider, lightBaseTheme } from "material-ui/styles";

const lightMuiTheme = getMuiTheme(lightBaseTheme);

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <MuiThemeProvider muiTheme={lightMuiTheme}>
        <Videos />
      </MuiThemeProvider>
    );
  }
}
