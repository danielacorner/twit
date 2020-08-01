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
  const filterFn = getFilterFn(req.query.filterBy);
  const tweets = await streamTweets({
    numTweets: +req.query.num,
    filterFn,
  });
  res.json(tweets);
});

app.listen(process.env.PORT || 8080);

const FILTER_BY = {
  imageOnly: "imageOnly",
  videoOnly: "videoOnly",
};

function getFilterFn(filterBy) {
  switch (filterBy) {
    case FILTER_BY.imageAndVideo:
      return (node) => {
        const first = getMediaArr(node)[0];
        return first && ["photo", "video"].includes(first.type);
      };
    case FILTER_BY.imageOnly:
      return (node) => {
        const first = getMediaArr(node)[0];
        return first && first.type === "photo";
      };
    case FILTER_BY.videoOnly:
      return (node) => {
        const first = getMediaArr(node)[0];
        return first && first.type === "video";
      };
    default:
      break;
  }
}
