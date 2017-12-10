export interface PageResults {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubeObj {
  kind: string;
  etag: string;
}

export interface YoutubeVideoListResponse extends YoutubeObj {
  pageInfo: PageResults;
  items: YoutubeVideo[];
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export interface Localized {
  title: string;
  description: string;
}

export interface Snippet {
  publishedAt: Date;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  defaultLanguage: string;
  localized: Localized;
  defaultAudioLanguage: string;
}

export interface ContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

export interface Statistics {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  favoriteCount: number;
  commentCount: number;
}

export interface YoutubeVideo extends YoutubeObj {
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
  statistics: Statistics;
}

export interface NedbVideo extends YoutubeVideo {
  _id?: string;
  ratio: number;
  score: number;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface Id {
  kind: string;
  videoId: string;
}

export interface SearchResult {
  kind: string;
  etag: string;
  id: Id;
  snippet: Snippet;
}

export interface SearchListResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: PageInfo;
  items: SearchResult[];
}
