// this is meant to become a bookmarklet that sends watched data back in

namespace BookmarkletLater {
  const items = document.querySelectorAll("ytd-playlist-video-renderer a");

  // TODO: scroll to end until the height does not change

  // window.scrollTo(0, document.getElementsByTagName("ytd-playlist-video-list-renderer")[0].scrollHeight)

  // add a wait step here so that everything loads?

  const all_ids = [];

  Array.from(items).forEach((item: HTMLAnchorElement) => {
    // TODO: fix the link regex
    // link to match: https://www.youtube.com/watch?v=P7XHzqZjXQs&index=1&list=WL
    const matches = item.href.match(
      /https:\/\/www.youtube.com\/watch\?v=(.*?)(?:t=(.*)s)?&(list|index)=.*?$/
    );
    if (matches != null) {
      const id = matches[1];

      if (all_ids.indexOf(id) === -1) {
        all_ids.push(id);
      }
    }
  });

  const url_param = all_ids.map(encodeURIComponent).join(",");

  // TODO: this needs to be a variable for the server
  const ids_string = "http://localhost:3001/later?ids=" + url_param;

  console.log(ids_string);

  // this needs to open a new window with that page instead of logging to console
  window.location.href = ids_string;
}
