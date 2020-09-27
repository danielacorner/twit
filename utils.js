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

const FILTER_LEVEL = {
  none: "none",
  low: "low",
  medium: "medium",
};

function filterByMediaType(node, allowedMediaTypes) {
  const mediaArr = getMediaArr(node);
  const first = mediaArr[0];

  if (!allowedMediaTypes || allowedMediaTypes.length === 0) {
    return true;
  } else if (
    allowedMediaTypes.includes("text") &&
    allowedMediaTypes.includes("video") &&
    allowedMediaTypes.includes("photo")
  ) {
    return !first;
  } else if (
    allowedMediaTypes.includes("photo") &&
    allowedMediaTypes.includes("video")
  ) {
    return first && first.type && ["photo", "video"].includes(first.type);
  } else if (
    allowedMediaTypes.includes("photo") &&
    allowedMediaTypes.includes("text")
  ) {
    return (
      // don't need to have an item
      !first ||
      // if we do, all items can only be video
      mediaArr.reduce(
        (acc, mediaItem) => acc && mediaItem.type !== "video",
        true
      )
    );
  } else if (
    allowedMediaTypes.includes("video") &&
    allowedMediaTypes.includes("text")
  ) {
    return (
      // don't need to have an item
      !first ||
      // if we do, all items can only be photo
      mediaArr.reduce(
        (acc, mediaItem) => acc && mediaItem.type !== "photo",
        true
      )
    );
  } else if (allowedMediaTypes.includes("video")) {
    return first && first.type && first.type === "video";
  } else if (allowedMediaTypes.includes("photo")) {
    return first && first.type && first.type === "photo";
  } else if (allowedMediaTypes.includes("text")) {
    return !first;
  } else {
    return true;
  }
}

// stream -> receive continuously
const stream = T.stream("statuses/sample");

module.exports = {
  getMediaArr,
  sentiment,
  T,
  stream,
  FILTER_LEVEL,
  filterByMediaType,
};
