import * as React from "react";

import { Navbar, Nav, NavItem } from "react-bootstrap";

export class Header extends React.Component<{}, {}> {
  updateData() {
    console.log("do update data");
    fetch("/updateData", {
      method: "GET"
    });
    return false;
  }

  doAuth() {
    console.log("do auth");
    fetch("/auth", {
      method: "GET"
    });

    // TODO: handle the redirect here also
    return false;
  }

  doCreatePlaylist() {
    console.log("do create playlist");
    fetch("/create_playlist", {
      method: "GET"
    });

    // TODO: handle the redirect here also
    return false;
  }

  render() {
    // tslint:disable-next-line:max-line-length
    let bookmarkUrl = `javascript:(function(){var c=window.location.href;if(c.indexOf("youtube.com/feed/history")>0){console.log("history");var a=document.querySelectorAll("ytd-video-renderer a");var e=[];Array.from(a).forEach(function(h){var i=h.href.match(/https:\\/\\/www.youtube.com\\/watch\\?v=(.*?)(?:&t=(.*)s)?$/);if(i!=null){var j=i[1];if(e.indexOf(j)===-1){e.push(j)}}});var f=e.map(encodeURIComponent).join(",");var g="http://localhost:3001";var d=g+"/watched?ids="+f;window.location.href=d}else{if(c.indexOf("youtube.com/playlist?list=WL")>0){console.log("watch later");var a=document.querySelectorAll("ytd-playlist-video-renderer a");var b=[];Array.from(a).forEach(function(h){var i=h.href.match(/https:\\/\\/www.youtube.com\\/watch\\?v=(.*?)(?:&t=(.*)s)?&(list|index)=.*?$/);if(i!=null){var j=i[1];if(b.indexOf(j)===-1){b.push(j)}}});var f=b.map(encodeURIComponent).join(",");var d="http://localhost:3001/later?ids="+f;window.location.href=d}else{console.log("some other page")}}})();`;

    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">youtube-recs</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem eventKey={1} href={bookmarkUrl}>
            bookmarklet
          </NavItem>
          <NavItem href="https://www.youtube.com/feed/history">
            youtube history
          </NavItem>
          <NavItem href="https://www.youtube.com/playlist?list=WL">
            youtube watch later
          </NavItem>
          <NavItem href="#" onClick={() => this.updateData()}>
            update data
          </NavItem>
          <NavItem eventKey={2} href="#" onClick={() => this.doAuth()}>
            authorize youtube
          </NavItem>
          <NavItem
            eventKey={3}
            href="#"
            onClick={() => this.doCreatePlaylist()}
          >
            create playlist
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}
