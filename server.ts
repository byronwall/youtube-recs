import {
  YoutubeVideoListResponse,
  NedbVideo,
  YoutubeVideo,
  SearchListResponse
} from "./client/src/youtube";
import * as nedb from "nedb";
import * as express from "express";
import * as google from "googleapis";

import * as rp from "request-promise-native";
import { Response } from "express";

import * as path from "path";
import * as bodyParser from "body-parser";

try {
  // this calls some process.env calls to set up ENV variables for YOUTUBE API
  require("../api-keys/youtube");
} catch (e) {
  console.log("missing import for api keys... no issue if they are set in ENV");
}

let API_KEY = process.env.API_KEY;
let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;

const youtube = google.youtube("v3");
const app = express();

app.use(bodyParser.json());

// Serve static files from the React app
// TODO: update this path
app.use(express.static(path.join(__dirname, "../client/build")));

// load the database
const db = new nedb({ filename: "./data.db", autoload: true });

db.ensureIndex({ fieldName: "id", unique: true });

var oauth2Client = google.auth.OAuth2;
var REDIRECT_URL = "http://localhost:3001/auth_callback";
var thisOAuthClient = new oauth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// TODO: these auth calls should flow better

app.get("/auth", (req, res) => {
  console.log("creating auth url...");

  REDIRECT_URL = req.headers.origin + "/auth_callback";
  thisOAuthClient = new oauth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  authorize(res, true);
});

function authorize(res: Response, shouldRedirect: boolean) {
  // TODO: handle a callback?
  const scopes = ["https://www.googleapis.com/auth/youtube"];

  if (fs.existsSync("./tokens.json")) {
    console.log("previous tokens were found... using those");
    thisOAuthClient.credentials = JSON.parse(
      fs.readFileSync("./tokens.json", "utf-8")
    );

    res.json({ authorized: true });
  } else {
    var url = thisOAuthClient.generateAuthUrl({
      access_type: "offline",
      scope: scopes
    });

    // TODO: clean this up into a proper typed return
    res.json({ url });
    console.log("sent redirect");
  }

  return false;
}

import * as fs from "fs";

app.get("/auth_callback", (req, res) => {
  console.log(req.query.code);

  const code = req.query.code;

  thisOAuthClient.getToken(code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      // write tokens to disk
      fs.writeFileSync("./tokens.json", JSON.stringify(tokens));

      thisOAuthClient.setCredentials(tokens);
      console.log("token was created and saved");

      // TODO: this needs to kick back into the site somewhere
      res.redirect("http://localhost:3000");
    } else {
      console.log(err);
    }
  });
});

interface APICreatePlaylist {
  ids: string;
}

app.post("/create_playlist", (req, res) => {
  // TODO: pull this out into a find or create
  // TODO: pull this out into its own method regardless of find/create

  console.log(req.body);
  const videoIds = req.body;

  youtube.playlists.insert(
    {
      part: "snippet,status",
      forUsername: "mine",
      auth: thisOAuthClient,
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
        addIdsToPlaylist(playlistId, videoIds);
      }
    }
  );

  res.redirect("http://localhost:3000");
});

app.get("/create_playlist", (req, res) => {
  // TODO: pull this out into a find or create
  // TODO: pull this out into its own method regardless of find/create
  youtube.playlists.insert(
    {
      part: "snippet,status",
      forUsername: "mine",
      auth: thisOAuthClient,
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
});

app.get("/later", (req, res) => {
  // this is the end point that will add a watched video to the database

  const query: ApiWatched = req.query;

  const parts = query.ids.split(",");

  parts.forEach(id => {
    console.log(id);

    // add the watch later video
    db.insert({ id }, (err, newDoc) => {
      if (err) {
        console.log("insert error", err);
      } else {
        console.log("insert result", newDoc);
      }
    });

    // TODO: add the item to the DB, queue up the API call to get data
  });

  res.send("done");
});

interface ApiRelated {
  id: string;
}

app.get("/related", (req, res) => {
  // this is the end point that will add a watched video to the database

  authorize(res, false);

  const query: ApiRelated = req.query;

  const id = query.id;

  // TODO: clean this up to run and retrieve as many results as desired... don't nest thens
  const a = getRelatedVideos(id);
  const b = a.then((response: any) => {
    return getRelatedVideos(id, response.nextPageToken);
  });
  const c = b.then((response: any) => {
    return getRelatedVideos(id, response.nextPageToken);
  });

  const d = Promise.all([a, b, c]).then(results => {
    console.log(results);
    res.json(results);
  });

  console.log("calling related ", id);

  // call to api to get related
});

function getRelatedVideos(id: string, pageToken?: string) {
  return new Promise((resolve, reject) => {
    youtube.search.list(
      {
        part: "snippet",
        auth: thisOAuthClient,
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

app.get("/updateData", (req, res) => {
  // this is the end point that will add a watched video to the database

  updateMissingData();

  res.send("it's going... check the server console");
});

app.get("/updateRatio", (req, res) => {
  // this is the end point that will add a watched video to the database

  updateRatio();

  res.send("it's going... check the server console");
});

app.get("/data", (req, res) => {
  // grabs the data and sorts by score
  // this is meant to be picked up by the React page
  db
    .find({ watched: { $exists: false } })
    .sort({ ratio: -1 })
    .exec((err, videos: NedbVideo[]) => {
      res.json(videos);
    });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const port = process.env.PORT || 3001;
app.listen(port);

console.log("server running...");

function processAllDataInSerial(ids: string[]) {
  return ids.reduce((chain, nextId) => {
    console.log("reducer", nextId);
    return chain.then(() => {
      return loadFromApiAndAddToDb(nextId);
    });
  }, Promise.resolve());
}

function updateRatio() {
  db.find({ watched: { $exists: false } }, (err, docs: NedbVideo[]) => {
    docs.forEach(doc => {
      const newDoc = processDoc(doc);

      db.update(
        { _id: newDoc._id },
        {
          $set: {
            ratio: newDoc.ratio,
            score: newDoc.score,
            statistics: newDoc.statistics
          }
        },
        { multi: true },
        (err, num) => {
          console.log("err", err, "num", num);
        }
      );
    });
  });
}

function processDoc(doc: YoutubeVideo) {
  // convert the stats info to numbers

  const newDoc: NedbVideo = { ...doc, ratio: null, score: null };

  Object.keys(newDoc.statistics).forEach(key => {
    newDoc.statistics[key] = parseInt(newDoc.statistics[key]);
  });

  newDoc.ratio =
    newDoc.statistics.likeCount / Math.max(newDoc.statistics.dislikeCount, 1);
  newDoc.score = newDoc.ratio * newDoc.statistics.viewCount;

  return newDoc;
}

function loadFromApiAndAddToDb(id: string) {
  console.log("loading called...", id, new Date());

  // TODO: add a check here to only load new videos

  // build the API request using the ID and desired info
  const parts = ["snippet", "contentDetails", "statistics"];
  const params = {
    uri: "https://www.googleapis.com/youtube/v3/videos",
    qs: {
      part: parts.join(","),
      id: id,
      key: API_KEY
    },
    json: true
  };

  // return a Promise for the API request and then push into the database
  return rp(params)
    .then((videos: YoutubeVideoListResponse) => {
      videos.items.forEach(item => {
        // take the object and push to a database

        const newDoc = processDoc(item);

        db.update({ id: newDoc.id }, newDoc);
        console.log("inserted into DB", id);
      });
    })
    .catch(err => {
      console.log("error while loading: ", err);
    });
}

function updateMissingData() {
  // grab the IDs that do not have a kind field
  db.find({ kind: { $exists: false } }, (err, docs: NedbVideo[]) => {
    if (err) {
      throw err;
    }

    const docIds = docs.map(doc => doc.id);

    console.log(docIds);

    // send those to the API to load the data

    // update the DB with that data
    processAllDataInSerial(docIds).then(() => {
      console.log("all of those items have been updated");
    });
  });
}

/* code to remove bad entries if needed

db.remove({ kind: { $exists: false } }, { multi: true }, (err, number) => {
  console.log("error", err, "number", number);
});

*/

function addTopItemsToPlaylist(id) {
  // hit the db to get the top items first

  getBestGroups(20, videos => {
    console.log("best", videos.map(video => video.snippet.title));

    videos.reduce((chain, video) => {
      return chain.then(() => {
        return addVideoToPlaylist(id, video.id);
      });
    }, Promise.resolve({}));
  });
}

function addIdsToPlaylist(playlistId: string, videoIds: string[]) {
  videoIds.reduce((chain, id) => {
    return chain.then(() => {
      return addVideoToPlaylist(playlistId, id);
    });
  }, Promise.resolve({}));
}

function addVideoToPlaylist(playlistId: string, videoId: string) {
  return new Promise((resolve, reject) => {
    youtube.playlistItems.insert(
      {
        part: "snippet",
        auth: thisOAuthClient,
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
        if (video.snippet !== undefined) {
          const channel = video.snippet.channelTitle;
          if (videoGroups[channel] === undefined) {
            videoGroups[channel] = video;
          }
        }
      });

      callback(
        Object.keys(videoGroups)
          .map(key => videoGroups[key])
          .slice(0, countItems)
      );
    });
}
