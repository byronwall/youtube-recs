// this is meant to become a bookmarklet that sends watched data back in
namespace BookmarkletHistory {
  const items = document.querySelectorAll("ytd-video-renderer a");

  const all_ids = [];

  Array.from(items).forEach((item: HTMLAnchorElement) => {
    const matches = item.href.match(
      /https:\/\/www.youtube.com\/watch\?v=(.*?)(?:t=(.*)s)?$/
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
  const ids_string = "http://localhost:3001/watched?ids=" + url_param;

  console.log(ids_string);

  // this needs to open a new window with that page instead of logging to console
  window.location.href = ids_string;
}
