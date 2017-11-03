import { NedbVideo } from "./youtube";
import { Video } from "./Video";
import * as React from "react";
import { GridList } from "material-ui";

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
        <GridList cols={5}>
          {this.state.videos.map(video => (
            <Video key={video._id} video={video} />
          ))}
        </GridList>
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
