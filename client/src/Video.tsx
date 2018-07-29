import { Duration } from "js-joda";
import * as numeral from "numeral";
import * as React from "react";
import { Col, Row, Glyphicon, Button } from "react-bootstrap";

import { truncate } from "./Helpers";
import { NedbVideo } from "./youtube";
import { Link } from "react-router-dom";

interface VideoProps {
  video: NedbVideo;
  handleRemove(): void;
  showRelated(): void;
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
          <Col md={2}>
            <a href={"https://youtube.com/watch?v=" + video.id}>
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
              <span>{" | "}</span>
              <span>{numeral(video.score).format("0,0")}</span>
              <span>{" | "}</span>
              <span>
                <Glyphicon glyph="thumbs-up" />
                <Glyphicon glyph="thumbs-down" />{" "}
                {numeral(video.ratio).format("0.0")}
              </span>
              <span>{" | "}</span>
              <span>
                <Glyphicon glyph="time" />{" "}
                {prettyDuration(video.contentDetails.duration)}
              </span>
            </p>
          </Col>
          <Col md={1}>
            <Link to={"/related/" + this.props.video.id}>
              <Glyphicon glyph="random" />
            </Link>
            <Button onClick={this.props.handleRemove}>
              <Glyphicon glyph="remove" />
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

function prettyDuration(duration: string) {
  return numeral(Duration.parse(duration).toMillis() / 1000 / 60).format("0.0");
}
