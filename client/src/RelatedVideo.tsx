import * as React from "react";
import { Col, Glyphicon, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { truncate } from "./Helpers";
import { SearchResult } from "./youtube";

interface VideoProps {
  video: SearchResult;
}

export class RelatedVideo extends React.Component<VideoProps, {}> {
  render() {
    const video = this.props.video;

    if (video.snippet === undefined) {
      return "empty";
    }

    return (
      <div>
        <Row>
          <Col md={2}>
            <a href={"https://youtube.com/watch?v=" + video.id.videoId}>
              <img src={video.snippet.thumbnails.default.url} />
            </a>
          </Col>
          <Col md={9}>
            <h4>{truncate(video.snippet.title, 60)}</h4>
            <p>
              <a
                href={
                  "https://www.youtube.com/channel/" + video.snippet.channelId
                }
              >
                {video.snippet.channelTitle}
              </a>
            </p>
          </Col>
          <Col md={1}>
            <Link to={"/related/" + this.props.video.id.videoId}>
              <Glyphicon glyph="random" />
            </Link>

            <Button
              onClick={() => {
                const id = this.props.video.id.videoId;
                console.log("add video", id);
                fetch("/later?ids=" + id);
              }}
            >
              <Glyphicon glyph="plus" />
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
