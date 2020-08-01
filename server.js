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
  const filterBy = req.query.filterBy;
  const filterFn = getFilterFn(filterBy, filterLevel);
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
function getFilterFn(filterBy, filterLevel) {
  switch (filterBy) {
    case FILTER_BY.imageAndVideo:
      return (node) => {
        const first = getMediaArr(node)[0];
        return (
          first &&
          first.type &&
          ["photo", "video"].includes(first.type) &&
          filterNodeByLevel(node, filterLevel)
        );
      };
    case FILTER_BY.imageOnly:
      return (node) => {
        const first = getMediaArr(node)[0];
        return (
          first &&
          first.type === "photo" &&
          filterNodeByLevel(node, filterLevel)
        );
      };
    case FILTER_BY.videoOnly:
      return (node) => {
        const first = getMediaArr(node)[0];
        return (
          first &&
          first.type === "video" &&
          filterNodeByLevel(node, filterLevel)
        );
      };
    default:
      break;
  }
}

function filterNodeByLevel(node, filterLevel) {
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
