import { NedbVideo } from "./youtube";
import * as React from "react";

import { Col, Thumbnail } from "react-bootstrap";
import * as numeral from "numeral";
import { truncate } from "./Helpers";

import { Duration } from "js-joda";

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
      <Col md={3}>
        <Thumbnail
          src={video.snippet.thumbnails.default.url}
          style={{ minHeight: 280 }}
          href={"https://youtube.com/watch?v=" + video.id}
        >
          <h4>{truncate(video.snippet.title, 60)}</h4>
          <p>
            <span>{numeral(video.score).format("0,0")}</span>
            <span>{" | "}</span>
            <span>{numeral(video.ratio).format("0.0")}</span>
          </p>
          <p>
            <span>{prettyDuration(video.contentDetails.duration)}</span>
          </p>
        </Thumbnail>
      </Col>
    );
  }
}

function prettyDuration(duration: string) {
  return numeral(Duration.parse(duration).toMillis() / 1000 / 60).format("0.0");
}
