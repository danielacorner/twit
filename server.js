const express = require("express");
const app = express();
const path = require("path");
const streamTweets = require("./streamTweets");
const { FILTER_LEVEL, filterByMediaType } = require("./utils");
const getTimeline = require("./getTimeline");
const getSearchResults = require("./getSearchResults");
const getUserInfo = require("./getUserInfo");

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

app.get("/api/user_timeline", async function (req, res) {
  const id_str = req.query.id_str;
  const numTweets = req.query.num;
  const tweets = await getTimeline({
    numTweets,
    userId: id_str,
  });
  res.json(tweets);
});

app.get("/api/user_info", async function (req, res) {
  const id_str = req.query.id_str;
  const screenName = req.query.screen_name;
  const userInfo = await getUserInfo({
    userId: id_str,
    screenName,
  });
  res.json(userInfo);
});

app.get("/api/search", async function (req, res) {
  const term = req.query.term;
  const numTweets = req.query.num;
  const lang = req.query.lang;
  const mediaType = req.query.mediaType;
  const tweets = await getSearchResults({
    numTweets,
    term,
    lang,
    mediaType,
  });
  res.json(tweets && tweets.data.statuses);
});

app.listen(process.env.PORT || 8080);

// tweet object
// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object
function getFilterFn({ mediaType, filterLevel, countryCode, lang }) {
  return (node) =>
    filterByMediaType(node, mediaType, filterLevel) &&
    filterByQualityLevel(node, filterLevel) &&
    filterByLocation(node, countryCode) &&
    filterByLang(node, lang);
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
