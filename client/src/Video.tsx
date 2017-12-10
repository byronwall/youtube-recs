import { NedbVideo } from "./youtube";
import * as React from "react";

import { Col, Thumbnail } from "react-bootstrap";
import * as numeral from "numeral";
import { truncate } from "./Helpers";

interface VideoProps {
  video: NedbVideo;
}

export class Video extends React.Component<VideoProps, {}> {
  render() {
    const video = this.props.video;

    return (
      <Col md={2}>
        <Thumbnail
          src={video.snippet.thumbnails.default.url}
          style={{ minHeight: 300 }}
          href={"https://youtube.com/watch?v=" + video.id}
        >
          <h4>{truncate(video.snippet.title, 60)}</h4>
          <p>
            <span>{numeral(video.score).format("0,0")}</span>
            <span>{" | "}</span>
            <span>{numeral(video.ratio).format("0.0")}</span>
          </p>
          <p>
            <span>{video.contentDetails.duration}</span>
          </p>
        </Thumbnail>
      </Col>
    );
  }
}
