import * as React from "react";

import { Navbar, Nav, NavItem } from "react-bootstrap";

export class Header extends React.Component<{}, {}> {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">youtube-recs</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem eventKey={1} href="#">
            bookmarklet
          </NavItem>
          <NavItem eventKey={2} href="http://localhost:3001/auth">
            authorize youtube
          </NavItem>
          <NavItem eventKey={3} href="http://localhost:3001/create_playlist">
            create playlist
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}
