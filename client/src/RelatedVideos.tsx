import * as React from "react";
import { Grid } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";

import { RelatedVideo } from "./RelatedVideo";
import { NedbVideo, SearchResult } from "./youtube";

interface VideosState {
  videos: SearchResult[];
}

interface MatchParams {
  id: string;
}

interface RelatedVideosProps extends RouteComponentProps<MatchParams> {}

export class RelatedVideos extends React.Component<
  RelatedVideosProps,
  VideosState
> {
  videosToShown: NedbVideo[];

  constructor(props: RelatedVideosProps) {
    super(props);

    this.state = {
      videos: []
    };
  }

  render() {
    return (
      <Grid>
        {this.state.videos.map(video => (
          <RelatedVideo key={video.id.videoId} video={video} />
        ))}
      </Grid>
    );
  }

  componentDidMount() {
    // make a call to the API for video data
    this.updateVideoList();
  }
  
  componentDidUpdate(prevProps: RelatedVideosProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.updateVideoList();
    }
  }

  updateVideoList() {
    console.log("related", this.props);

    fetch("/related?id=" + this.props.match.params.id)
      .then(response => {
        return response.json();
      })
      .then((videos: SearchResult[]) => {
        console.log("related videos", videos);
        this.setState({
          videos
        });
      });
  }
}
