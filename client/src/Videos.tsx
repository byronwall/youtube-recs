import { VideoFilters, FilterState } from "./VideoFilters";
import { NedbVideo } from "./youtube";
import { Video } from "./Video";
import * as React from "react";
import { Row, Grid, Col, Button } from "react-bootstrap";
import { Duration } from "js-joda";

interface VideosState {
  videos: NedbVideo[];
  filteredVideos: NedbVideo[];
}

export class Videos extends React.Component<{}, VideosState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      videos: [],
      filteredVideos: []
    };
  }

  processFilter(filters: FilterState) {
    const filteredVideos = this.state.videos.filter(video => {
      const length = Duration.parse(video.contentDetails.duration).toMinutes();
      return length < filters.maxLength && video.ratio > filters.minRatio;
    });

    this.setState({ filteredVideos });
  }
  processPlaylistCreation() {
    console.log("creating playlist");

    const ids = this.state.filteredVideos.map(video => {
      return video.id;
    });

    fetch("/create_playlist", {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ids)
    }).then(res => console.log(res));
  }
  render() {
    return (
      <Grid>
        <VideoFilters onUpdate={filters => this.processFilter(filters)} />
        <Row>
          <Col md={3}>
            <Button onClick={() => this.processPlaylistCreation()}>
              {"Create playlist of items"}{" "}
            </Button>
          </Col>
        </Row>
        <Row>
          {this.state.filteredVideos.map(video => (
            <Video key={video._id} video={video} />
          ))}
        </Row>
      </Grid>
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
          videos,
          filteredVideos: videos
        });
      });
  }
}
