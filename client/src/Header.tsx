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
          <NavItem
            eventKey={1}
            href={`javascript:(function () {
                var items = document.querySelectorAll("ytd-playlist-video-renderer a");                
                var all_ids = [];
                Array.from(items).forEach(function (item) {                    
                    var matches = item.href.match(/https:\/\/www.youtube.com\/watch\?v=(.*?)(?:&t=(.*)s)?&(list|index)=.*?$/);
                    if (matches != null) {
                        var id = matches[1];
                        if (all_ids.indexOf(id) === -1) {
                            all_ids.push(id);
                        }
                    }
                });
                var url_param = all_ids.map(encodeURIComponent).join(",");                
                var ids_string = "http://localhost:3001/later?ids=" + url_param;                
                window.location.href = ids_string;
            })()
            `}
          >
            bookmarklet - later
          </NavItem>
          <NavItem
            eventKey={1}
            href={`javascript:// this is meant to become a bookmarklet that sends watched data back in
            var BookmarkletHistory;
            (function (BookmarkletHistory) {
                var items = document.querySelectorAll("ytd-video-renderer a");
                var all_ids = [];
                Array.from(items).forEach(function (item) {
                    var matches = item.href.match(/https:\/\/www.youtube.com\/watch\?v=(.*?)(?:&t=(.*)s)?$/);
                    if (matches != null) {
                        var id = matches[1];
                        if (all_ids.indexOf(id) === -1) {
                            all_ids.push(id);
                        }
                    }a
                });
                var url_param = all_ids.map(encodeURIComponent).join(",");
                // TODO: this needs to be a variable for the server
                var ids_string = "http://localhost:3001/watched?ids=" + url_param;
                console.log(ids_string);
                // this needs to open a new window with that page instead of logging to console
                window.location.href = ids_string;
            })(BookmarkletHistory || (BookmarkletHistory = {}));
            
              `}
          >
            bookmarklet - history
          </NavItem>
          <NavItem href="https://www.youtube.com/feed/history">
            youtube history
          </NavItem>
          <NavItem href="https://www.youtube.com/playlist?list=WL">
            youtube watch later
          </NavItem>
          <NavItem href="http://localhost:3001/updateData">
            update data
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
