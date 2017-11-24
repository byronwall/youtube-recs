import { Packet, ResponseBodyHandler } from "_debugger";
import { NedbVideo } from "./client/src/youtube";
import * as nedb from "nedb";
import * as express from "express";
import * as google from "googleapis";

const youtube = google.youtube("v3");
const app = express();

// load the database
const db = new nedb({ filename: "./data.db", autoload: true });

var oauth2Client = google.auth.OAuth2;

// TODO: these secrets need to move
var CLIENT_ID =
  "200860882266-rvhl8bv9oftpe64ubbju6tnfbdruhij9.apps.googleusercontent.com";
var CLIENT_SECRET = "K1yhW4H-KSn1cLifL5BQ6nDP";
var REDIRECT_URL = "http://localhost:3001/auth_callback";

var oauth2Client = new oauth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// TODO: these auth calls should flow better

app.get("/auth", (req, res) => {
  var scopes = ["https://www.googleapis.com/auth/youtube"];

  console.log("creating auth url...");

  var url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  });
  res.redirect(url);
  console.log("sent redirect");
});

app.get("/auth_callback", (req, res) => {
  console.log(req.query.code);

  const code = req.query.code;

  oauth2Client.getToken(code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      console.log("token was created and saved");

      // TODO: this needs to kick back into the site somewhere
    } else {
      console.log(err);
    }
  });

  res.send("code was sent" + req.query.code);
});

app.get("/create_playlist", (req, res) => {
  // TODO: pull this out into a find or create
  // TODO: pull this out into its own method regardless of find/create
  youtube.playlists.insert(
    {
      part: "snippet,status",
      forUsername: "mine",
      auth: oauth2Client,
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

        const id = response.id;

        // take that id and add some items to it
        addTopItemsToPlaylist(id);
      }
    }
  );

  res.send("req was sent");
});

interface ApiWatched {
  ids: string;
}

app.get("/watched", (req, res) => {
  // this is the end point that will add a watched video to the database

  const query: ApiWatched = req.query;

  const parts = query.ids.split(",");

  parts.forEach(id => {
    console.log(id);

    db.update(
      { id: id },
      { $set: { watched: true } },
      {},
      (err, numReplace) => {
        console.log("updated", id, numReplace, err);
      }
    );
  });

  res.send("done");

  // parse out the ids (CSV)

  // do a create/update on the ids that come in

  // add a {watched: true} for the item found or flip otherwise
});

app.get("/later", (req, res) => {
  // this is the end point that will add a watched video to the database

  const query: ApiWatched = req.query;

  const parts = query.ids.split(",");

  parts.forEach(id => {
    console.log(id);

    // TODO: add the item to the DB, queue up the API call to get data
  });

  res.send("done");
});

app.get("/*", (req, res) => {
  // grabs the data and sorts by score
  // this is meant to be picked up by the React page
  db
    .find({})
    .sort({ score: -1 })
    .exec((err, videos: NedbVideo[]) => {
      res.json(videos);
    });
});

app.listen(3001);

console.log("server running...");

function addTopItemsToPlaylist(id) {
  // hit the db to get the top items first

  getBestGroups(10, videos => {
    console.log("best", videos.map(video => video.snippet.title));

    videos.reduce((chain, video) => {
      return chain.then(() => {
        return addVideoToPlaylist(id, video);
      });
    }, Promise.resolve({}));
  });
}

function addVideoToPlaylist(playlistId: string, video: NedbVideo) {
  return new Promise((resolve, reject) => {
    console.log(video.snippet.title);
    youtube.playlistItems.insert(
      {
        part: "snippet",
        auth: oauth2Client,
        resource: {
          snippet: {
            playlistId,
            resourceId: {
              videoId: video.id,
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

function getBest(count: number, callback: (videos: NedbVideo[]) => void) {
  db
    .find({})
    .sort({ score: -1 })
    .limit(count)
    .exec((err, videos: NedbVideo[]) => {
      callback(videos);
    });
}

function getBestGroups(
  countItems: number,
  callback: (videos: NedbVideo[]) => void
) {
  db
    .find({ watched: { $ne: true } })
    .sort({ score: -1 })
    .exec((err, videos: NedbVideo[]) => {
      // this gives a list of videos... need to find the channel name and group by that

      const videoGroups = [];

      videos.forEach(video => {
        const channel = video.snippet.channelTitle;
        if (videoGroups[channel] === undefined) {
          videoGroups[channel] = video;
        }
      });

      callback(
        Object.keys(videoGroups)
          .map(key => videoGroups[key])
          .slice(0, countItems)
      );
    });
}
