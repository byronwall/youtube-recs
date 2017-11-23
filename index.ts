import { YoutubeVideoListResponse } from "./client/src/youtube";
import { key as API_KEY } from "../api-keys/youtube";
import * as nedb from "nedb";
import * as rp from "request-promise-native";

interface Item {
  url: string;
}

var urls: Item[] = require("./data.json");

const videoIds = [];

urls.forEach(item => {
  const url = item.url;

  // break param string on = and then & to get ID
  const videoId = url.split("=")[1].split("&")[0];

  videoIds.push(videoId);
});

// create the database
const db = new nedb({ filename: "./data.db", autoload: true });

// grab the first 10 for testing
const idsToLoad = videoIds;

idsToLoad.reduce((chain, nextId) => {
  console.log("reducer", nextId);
  return chain.then(() => {
    return loadFromApiAndAddToDb(nextId);
  });
}, Promise.resolve());

function loadFromApiAndAddToDb(id: string) {
  console.log("loading called...", id, new Date());

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
  return rp(params).then((videos: YoutubeVideoListResponse) => {
    videos.items.forEach(item => {
      // take the object and push to a database
      db.insert(item);
      console.log("inserted into DB", id);
    });
  });
}
