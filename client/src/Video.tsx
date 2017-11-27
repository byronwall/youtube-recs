import { NedbVideo } from "./youtube";
import * as React from "react";

import { Col, Thumbnail } from "react-bootstrap";

interface VideoProps {
  video: NedbVideo;
}

export class Video extends React.Component<VideoProps, {}> {
  render() {
    const video = this.props.video;

    return (
      <Col md={3}>
        <Thumbnail
          src={video.snippet.thumbnails.default.url}
          style={{ minHeight: 400 }}
          href={"https://youtube.com/watch?v=" + video.id}
        >
          <h4>{video.snippet.title}</h4>
          <p>{video.score}</p>
          <p>{video.ratio}</p>
        </Thumbnail>
      </Col>
    );
  }
}
