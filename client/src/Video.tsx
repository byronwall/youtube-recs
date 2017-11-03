import { NedbVideo } from "./youtube";
import * as React from "react";
import { Card, GridTile } from "material-ui";

interface VideoProps {
  video: NedbVideo;
}

export class Video extends React.Component<VideoProps, {}> {
  render() {
    const video = this.props.video;

    return (
      <GridTile>
        <Card>
          <h4>{video.snippet.title}</h4>
          <p>{video.score}</p>
          <p>{video.ratio}</p>
        </Card>
      </GridTile>
    );
  }
}
