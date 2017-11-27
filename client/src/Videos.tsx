import { NedbVideo } from "./youtube";
import { Video } from "./Video";
import * as React from "react";
import { Row } from "react-bootstrap";

interface VideosState {
  videos: NedbVideo[];
}

export class Videos extends React.Component<{}, VideosState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      videos: []
    };
  }
  render() {
    return (
      <div>
        <Row>
          {this.state.videos.map(video => (
            <Video key={video._id} video={video} />
          ))}
        </Row>
      </div>
    );
  }

  componentDidMount() {
    // make a call to the API for video data

    fetch("/data")
      .then(response => {
        return response.json();
      })
      .then((videos: NedbVideo[]) => {
        this.setState({
          videos
        });
      });
  }
}
