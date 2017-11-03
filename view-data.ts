import { NedbVideo } from "./client/src/youtube";
import * as nedb from "nedb";
import * as express from "express";

const app = express();

// create the database
const db = new nedb({ filename: "./data.db", autoload: true });

app.get("*", (req, res) => {
  db
    .find({})
    .sort({ score: -1 })
    .exec((err, videos: NedbVideo[]) => {
      res.json(videos);

      /*

      videos.forEach(video => {
        // const stats = video.statistics;
        const details = video.snippet;

        console.log(details.title, video.score, video.ratio);

        // const ratio = stats.likeCount / (stats.dislikeCount + 0.1);
        // const score = ratio * stats.viewCount;

        //db.update({ _id: video._id }, { $set: { ratio, score } });
      });

      */
    });
});

app.listen(3001);
