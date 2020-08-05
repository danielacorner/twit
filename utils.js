const Sentiment = require("sentiment");

function getMediaArr(node) {
  return (
    (node.extended_entities &&
      node.extended_entities.media.map((media) => ({
        ...media,
        src:
          media && media.type === "video"
            ? media.video_info &&
              media.video_info.variants.find(
                ({ content_type }) => content_type === "video/mp4"
              ).url
            : media.media_url_https,
        poster: media.media_url_https,
      }))) ||
    []
  );
}

// https://www.npmjs.com/package/sentiment#api-reference
const sentiment = new Sentiment();

const { config } = require("./config");

const Twit = require("twit");
// https://github.com/ttezel/twit
const T = new Twit(config);

const FILTER_BY = {
  imageAndVideo: "imageAndVideo",
  imageOnly: "imageOnly",
  videoOnly: "videoOnly",
};
const FILTER_LEVEL = {
  none: "none",
  low: "low",
  medium: "medium",
};

function filterByMediaType(node, mediaType, filterLevel) {
  const first = getMediaArr(node)[0];
  switch (mediaType) {
    case FILTER_BY.imageAndVideo:
      return first && first.type && ["photo", "video"].includes(first.type);
    case FILTER_BY.imageOnly:
      return first && first.type === "photo";
    case FILTER_BY.videoOnly:
      return first && first.type === "video";
    default:
      return true;
  }
}

module.exports = {
  getMediaArr,
  sentiment,
  T,
  FILTER_BY,
  FILTER_LEVEL,
  filterByMediaType,
};
