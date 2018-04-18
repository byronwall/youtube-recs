# CHANGELOG

## Todo

* the auth redirect URL needs to pass through the AJAX and open a new window... also need to get the callback URL correct.

* add a delete link to the videos to remove from list (or maybe "archive" so not
  added later)
* ability to limit the length of a video added to the playlist
* control over the total number of items (or playtime) in a playlist
* control over the name of the playlist; also whether to create new or overwrite
  previous
* client side page to view the playlist before create
* client side page to upvote and manage watched videos
* client side to explore networks of related videos
* client side to provide bookmarklets
* single bookmarklet for watch later / history
* documentation of the API
* split out the routing into separate files

## Unreleased

* [Client] Add header to site with links to items
* [Client] Corrected visuals of the cards (add `numeral` with better formatting,
  add `truncate`)
* [Server] Add code to fix the ratio and update previous results (values were
  stored as strings)
* [Server] Add redirects to certain spots to improve workflows (more work needed
  once down to single server)
* Add support for storing a user's credentials on server (works for a single
  user)
