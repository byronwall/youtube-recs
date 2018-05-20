import * as nedb from "nedb";
import { NedbVideo, YoutubeVideo } from "../../client/src/youtube";
import { Youtube } from "./youtube";

let db: nedb;

export class Database {
  // load the database

  static get() {
    if (db === undefined) {
      db = new nedb({ filename: "./data.db", autoload: true });
      db.ensureIndex({ fieldName: "id", unique: true });
    }

    return db;
  }

  static getDefaultData() {
    return new Promise((resolve, reject) => {
      this.get()
        .find({ watched: { $exists: false } })
        .sort({ ratio: -1 })
        .exec((err, videos: NedbVideo[]) => {
          resolve(videos);
        });
    });
  }

  static updateLater(parts) {
    parts.forEach(id => {
      console.log(id);

      // add the watch later video
      this.get().insert({ id }, (err, newDoc) => {
        if (err) {
          console.log("insert error", err);
        } else {
          console.log("insert result", newDoc);
        }
      });

      // TODO: add the item to the DB, queue up the API call to get data
    });
  }

  static updateWatched(ids) {
    ids.forEach(id => {
      console.log(id);

      this.get().update(
        { id: id },
        { $set: { watched: true } },
        {},
        (err, numReplace) => {
          console.log("updated", id, numReplace, err);
        }
      );
    });
  }

  static getBest(count: number, callback: (videos: NedbVideo[]) => void) {
    this.get()
      .find({})
      .sort({ score: -1 })
      .limit(count)
      .exec((err, videos: NedbVideo[]) => {
        callback(videos);
      });
  }

  static getBestGroups(
    countItems: number,
    callback: (videos: NedbVideo[]) => void
  ) {
    this.get()
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

  static updateRatio() {
    this.get().find(
      { watched: { $exists: false } },
      (err, docs: NedbVideo[]) => {
        docs.forEach(doc => {
          const newDoc = this.processDoc(doc);

          this.get().update(
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
      }
    );
  }

  static processDoc(doc: YoutubeVideo) {
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

  static async loadFromApiAndAddToDb(id: string) {
    console.log("loading called...", id, new Date());

    // TODO: add a check here to only load new videos

    let videos = await Youtube.getItemFromApi(id);
    videos.items.forEach(item => {
      // take the object and push to a database

      const newDoc = this.processDoc(item);

      this.get().update({ id: newDoc.id }, newDoc);
      console.log("inserted into DB", id);
    });
  }

  static updateMissingData() {
    // grab the IDs that do not have a kind field
    this.get().find({ kind: { $exists: false } }, (err, docs: NedbVideo[]) => {
      if (err) {
        throw err;
      }

      const docIds = docs.map(doc => doc.id);

      console.log(docIds);

      // send those to the API to load the data

      // update the DB with that data
      this.processAllDataInSerial(docIds).then(() => {
        console.log("all of those items have been updated");
      });
    });
  }

  static processAllDataInSerial(ids: string[]) {
    return ids.reduce((chain, nextId) => {
      console.log("reducer", nextId);
      return chain.then(() => {
        return this.loadFromApiAndAddToDb(nextId);
      });
    }, Promise.resolve());
  }
}
