const express = require("express");
const app = express();
const path = require("path");
const streamTweets = require("./streamTweets");
const { getMediaArr } = require("./utils");

app.use(express.static(`main`));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.get("/api/stream", async function (req, res) {
  const filterLevel = req.query.filterLevel;
  const mediaType = req.query.mediaType;
  const countryCode = req.query.countryCode;
  const lang = req.query.lang;
  const filterFn = getFilterFn({ mediaType, filterLevel, countryCode, lang });
  const tweets = await streamTweets({
    numTweets: +req.query.num,
    filterFn,
    filterLevel,
  });
  res.json(tweets);
});

app.listen(process.env.PORT || 8080);

const FILTER_BY = {
  imageAndVideo: "imageAndVideo",
  imageOnly: "imageOnly",
  videoOnly: "videoOnly",
};
const FILTER_LEVEL = {
  none: "none",
  low: "low",
  medium: "medium",
  // high: "high",
};

// tweet object
// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object
function getFilterFn({ mediaType, filterLevel, countryCode, lang }) {
  return (node) =>
    filterByMediaType(node, mediaType, filterLevel) &&
    filterByQualityLevel(node, filterLevel) &&
    filterByLocation(node, countryCode) &&
    filterByLang(node, lang);
}

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

function filterByQualityLevel(node, filterLevel) {
  switch (filterLevel) {
    case FILTER_LEVEL.none:
      return true;
    case FILTER_LEVEL.low:
      return [FILTER_LEVEL.low, FILTER_LEVEL.medium].includes(
        node.filter_level
      );
    case FILTER_LEVEL.medium:
      return [FILTER_LEVEL.medium].includes(node.filter_level);
    default:
      return true;
  }
}

function filterByLocation(node, countryCode) {
  return !countryCode || node.country_code === countryCode;
}

function filterByLang(node, lang) {
  return !lang || node.lang === lang;
}
