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

  if (
    // if none specified,
    !allowedMediaTypes ||
    allowedMediaTypes.length === 0 ||
    // or if all specified,
    (allowedMediaTypes.includes("text") &&
      allowedMediaTypes.includes("video") &&
      allowedMediaTypes.includes("photo") &&
      allowedMediaTypes.includes("animated_gif"))
  ) {
    // don't filter
    return true;
  } else if (
    // if one of photo, video, or animated_gif is specified,
    allowedMediaTypes.includes("photo") ||
    allowedMediaTypes.includes("animated_gif") ||
    allowedMediaTypes.includes("video")
  ) {
    // is media required?
    const isMediaRequired = !allowedMediaTypes.includes("text");

    if (isMediaRequired) {
      return first && first.type && allowedMediaTypes.includes(first.type);
    } else {
      // allow tweets without media
      return !first || (first.type && allowedMediaTypes.includes(first.type));
    }
  } else {
    // fallback to true in case something goes wrong
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
