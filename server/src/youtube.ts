import {
  YoutubeVideoListResponse,
  NedbVideo,
  YoutubeVideo,
  SearchListResponse
} from "../../client/src/youtube";
import * as nedb from "nedb";
import * as express from "express";
import * as google from "googleapis";

import * as rp from "request-promise-native";
import { Response } from "express";

import * as path from "path";
import * as bodyParser from "body-parser";

import * as fs from "fs";
import { Database } from "./database";

const youtube = google.youtube("v3");
const oauth2Client = google.auth.OAuth2;

export class Youtube {
  thisOAuthClient;

  static API_KEY;

  createPlaylist(videoIds) {
    youtube.playlists.insert(
      {
        part: "snippet,status",
        forUsername: "mine",
        auth: this.thisOAuthClient,
        resource: {
          snippet: {
            title: "Algo Watch Later",
            description: "description"
          },
          status: {
            privacyStatus: "private"
          }
        }
      },
      (err, response) => {
        if (err) {
          console.log("error", err);
        } else {
          console.log("response", response);

          const playlistId = response.id;

          // take that id and add some items to it
          this.addIdsToPlaylist(playlistId, videoIds);
        }
      }
    );
  }

  addTopItemsToPlaylist(id) {
    // hit the db to get the top items first

    Database.getBestGroups(20, videos => {
      console.log("best", videos.map(video => video.snippet.title));

      videos.reduce((chain, video) => {
        return chain.then(() => {
          return this.addVideoToPlaylist(id, video.id);
        });
      }, Promise.resolve({}));
    });
  }

  addIdsToPlaylist(playlistId: string, videoIds: string[]) {
    videoIds.reduce((chain, id) => {
      return chain.then(() => {
        return this.addVideoToPlaylist(playlistId, id);
      });
    }, Promise.resolve({}));
  }

  addVideoToPlaylist(playlistId: string, videoId: string) {
    return new Promise((resolve, reject) => {
      youtube.playlistItems.insert(
        {
          part: "snippet",
          auth: this.thisOAuthClient,
          resource: {
            snippet: {
              playlistId,
              resourceId: {
                videoId: videoId,
                kind: "youtube#video"
              }
            }
          }
        },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  authorize(res: Response, shouldRedirect: boolean) {
    try {
      // this calls some process.env calls to set up ENV variables for YOUTUBE API
      require("../../../api-keys/youtube");
    } catch (e) {
      console.log(
        "missing import for api keys... no issue if they are set in ENV"
      );
    }

    // HACK: clean this up
    Youtube.API_KEY = process.env.API_KEY;
    let CLIENT_ID = process.env.CLIENT_ID;
    let CLIENT_SECRET = process.env.CLIENT_SECRET;

    var REDIRECT_URL = "http://localhost:3001/auth_callback";
    this.thisOAuthClient = new oauth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL
    );

    // TODO: handle a callback?
    const scopes = ["https://www.googleapis.com/auth/youtube"];

    // TODO: move this up if it will short circuit the rest
    if (fs.existsSync("./tokens.json")) {
      console.log("previous tokens were found... using those");
      this.thisOAuthClient.credentials = JSON.parse(
        fs.readFileSync("./tokens.json", "utf-8")
      );

      res.json({ authorized: true });
    } else {
      var url = this.thisOAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: scopes
      });

      // TODO: clean this up into a proper typed return
      res.json({ url });
      console.log("sent redirect");
    }

    return false;
  }

  static async getItemFromApi(id) {
    const parts = ["snippet", "contentDetails", "statistics"];
    const params = {
      uri: "https://www.googleapis.com/youtube/v3/videos",
      qs: {
        part: parts.join(","),
        id: id,
        key: this.API_KEY
      },
      json: true
    };

    // return a Promise for the API request and then push into the database
    let videos = await rp(params);
    return videos;
  }

  handleAuthCallback(code) {
    return new Promise((resolve, reject) => {
      this.thisOAuthClient.getToken(code, function(err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (!err) {
          // write tokens to disk
          fs.writeFileSync("./tokens.json", JSON.stringify(tokens));

          this.thisOAuthClient.setCredentials(tokens);
          console.log("token was created and saved");

          // TODO: this needs to kick back into the site somewhere

          resolve(true);
        } else {
          console.log(err);
        }
      });
    });
  }

  getRelatedVideos(id: string, pageToken?: string) {
    return new Promise((resolve, reject) => {
      youtube.search.list(
        {
          part: "snippet",
          auth: this.thisOAuthClient,
          relatedToVideoId: id,
          pageToken,
          type: "video"
        },
        (err, response: SearchListResponse) => {
          if (err) {
            console.log("error", err);
            reject(err);
          } else {
            console.log("response", response);

            // TODO: iterate through the pages returned using the next page token...

            response.items.forEach(item => {
              console.log(
                item.id.videoId,
                item.snippet.channelTitle,
                item.snippet.title
              );

              // add each item to the database, and then update info for those results... add a {related:true}
            });

            resolve(response);
          }
        }
      );
    });
  }
}
