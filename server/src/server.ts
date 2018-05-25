import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";
import { Database } from "./database";
import { ApiRelated, ApiWatched } from "./interfaces";
import { Youtube } from "./youtube";

export class Server {
  youtubeInst: Youtube;
  constructor() {
    this.youtubeInst = new Youtube();
  }
  start() {
    const app = express();

    app.use(bodyParser.json());

    // Serve static files from the React app
    // TODO: update this path
    app.use(express.static(path.join(__dirname, "../../client/build")));

    app.get("/auth", (req, res) => {
      console.log("creating auth url...");

      this.youtubeInst.authorize(res, req.headers.origin as string, true);
    });

    app.get("/auth_callback", async (req, res) => {
      console.log(req.query.code);

      const code = req.query.code;

      let authResult = await this.youtubeInst.handleAuthCallback(code);

      if (authResult) {
        res.redirect(req.headers.origin as string);
      }
    });

    app.get("/create_playlist", (req, res) => {
      this.youtubeInst.createPlaylist();

      // TODO: fix this bad adddress
      res.redirect("http://localhost:3000");
    });

    app.get("/watched", (req, res) => {
      // this is the end point that will add a watched video to the database

      const query: ApiWatched = req.query;

      const parts = query.ids.split(",");

      Database.updateWatched(parts);

      res.send("done");
    });

    app.get("/later", (req, res) => {
      // this is the end point that will add a watched video to the database

      const query: ApiWatched = req.query;

      const parts = query.ids.split(",");

      Database.updateLater(parts);

      res.send("done");
    });

    app.get("/related", (req, res) => {
      // this is the end point that will add a watched video to the database

      this.youtubeInst.authorize(res, req.headers.origin as string, false);

      const query: ApiRelated = req.query;

      const id = query.id;

      // TODO: clean this up to run and retrieve as many results as desired... don't nest thens
      const a = this.youtubeInst.getRelatedVideos(id);
      const b = a.then((response: any) => {
        return this.youtubeInst.getRelatedVideos(id, response.nextPageToken);
      });
      const c = b.then((response: any) => {
        return this.youtubeInst.getRelatedVideos(id, response.nextPageToken);
      });

      const d = Promise.all([a, b, c]).then(results => {
        console.log(results);
        res.json(results);
      });

      console.log("calling related ", id);

      // call to api to get related
    });

    app.get("/updateData", (req, res) => {
      // this is the end point that will add a watched video to the database

      Database.updateMissingData();

      res.send("it's going... check the server console");
    });

    app.get("/updateRatio", (req, res) => {
      // this is the end point that will add a watched video to the database

      Database.updateRatio();

      res.send("it's going... check the server console");
    });

    app.get("/data", async (req, res) => {
      // grabs the data and sorts by score
      // this is meant to be picked up by the React page

      let videos = await Database.getDefaultData();
      res.json(videos);
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../client/build/index.html"));
    });

    const port = process.env.PORT || 3001;
    app.listen(port);

    console.log("server running...");
  }
}
