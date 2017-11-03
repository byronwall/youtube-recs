# Code used to scrape the watch later playlist

```js
artoo.scrape("ytd-playlist-video-renderer>a", {url:"href"}, artoo.savePrettyJson)
```