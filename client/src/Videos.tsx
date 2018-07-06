import { Duration } from "js-joda";
import * as React from "react";
import { Button, Col, Grid, Row } from "react-bootstrap";

import { Video } from "./Video";
import { FilterState, VideoFilters } from "./VideoFilters";
import { NedbVideo } from "./youtube";

interface VideosState {
  videos: NedbVideo[];
  filteredVideos: NedbVideo[];
}

function getScore(video: NedbVideo) {
  return video.statistics.viewCount * video.ratio!;
}
interface ResponseRemove {
  result: boolean;
}
export class Videos extends React.Component<{}, VideosState> {
  videosToShown: NedbVideo[];

  constructor(props: {}) {
    super(props);

    this.state = {
      videos: [],
      filteredVideos: []
    };
  }

  handleRemove(id: string) {
    console.log("remove at server", id);

    (async () => {
      const rawResponse = await fetch("/remove", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });
      const content: ResponseRemove = await rawResponse.json();

      if (content) {
        if (content.result) {
          // remove that id from the local video list
          let newVideos = this.state.videos.filter(video => video._id !== id);

          this.setState({ videos: newVideos });
        }
      }

      console.log("post response", content);
    })();

    // hit the server end point to remove from DB
  }

  processFilter(filters: FilterState) {
    const filteredVideos = this.state.videos
      .filter(video => {
        if (video.contentDetails === undefined) {
          return false;
        }

        const length = Duration.parse(
          video.contentDetails.duration
        ).toMinutes();
        return length < filters.maxLength && video.ratio! > filters.minRatio;
      })
      .sort((videoA, videoB) => {
        return getScore(videoB) - getScore(videoA);
      })
      .slice(0, 30);

    // TODO make that slice a variable

    this.videosToShown = filteredVideos;
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
    this.processFilter({
      maxLength: 20,
      minRatio: 1
    });

    return (
      <Grid>
        <VideoFilters onUpdate={filters => this.processFilter(filters)} />
        <Row>
          <Col md={3}>
            <Button onClick={() => this.processPlaylistCreation()}>
              {"Create playlist of items"}
            </Button>
          </Col>
        </Row>

        {this.videosToShown.map(video => (
          <Video
            key={video._id}
            video={video}
            handleRemove={() => this.handleRemove(video._id!)}
          />
        ))}
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
          videos
        });
      });
  }
}
