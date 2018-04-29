import { NedbVideo } from "./youtube";
import * as React from "react";

import * as numeral from "numeral";
import { truncate } from "./Helpers";

import { Duration } from "js-joda";
import { Col, Row } from "react-bootstrap";

interface VideoProps {
  video: NedbVideo;
}

export class Video extends React.Component<VideoProps, {}> {
  render() {
    const video = this.props.video;

    if (video.snippet === undefined) {
      return "empty";
    }

    return (
      <div>
        <Row>
          <Col md={3}>
            <a href={"https://youtube.com/watch?v=" + video.id}>
              <img src={video.snippet.thumbnails.default.url} />
            </a>
          </Col>
          <Col md={9}>
            <h4>{truncate(video.snippet.title, 60)}</h4>
            <p>
              <span>{numeral(video.score).format("0,0")}</span>
              <span>{" | "}</span>
              <span>{numeral(video.ratio).format("0.0")}</span>
              <span>{" | "}</span>
              <span>{prettyDuration(video.contentDetails.duration)}</span>
            </p>
          </Col>
        </Row>
      </div>
    );
  }
}

function prettyDuration(duration: string) {
  return numeral(Duration.parse(duration).toMillis() / 1000 / 60).format("0.0");
}
