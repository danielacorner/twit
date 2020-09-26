const express = require("express");
const app = express();
const path = require("path");
const streamTweets = require("./streamTweets");
const { FILTER_LEVEL, filterByMediaType } = require("./utils");
const getTimeline = require("./getTimeline");
const getSearchResults = require("./getSearchResults");
const getUserInfo = require("./getUserInfo");
const streamFilteredTweets = require("./streamFilteredTweets");
const getTweets = require("./getTweets");
const getLikes = require("./getLikes");

app.use(express.static(`main`));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/sample-realtime/overview/get_statuses_sample
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

app.get("/api/get", async function (req, res) {
  const ids = req.query.ids.split(",");

  const tweets = await getTweets(ids).catch((err) => console.log(err));

  res.json(tweets);
});

// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/filter-realtime/api-reference/post-statuses-filter
app.get("/api/filter", async function (req, res) {
  const locations = req.query.locations;
  const mediaType = req.query.mediaType;
  const filterFn = getFilterFn({ mediaType });

  const tweets = await streamFilteredTweets({
    numTweets: +req.query.num,
    filterFn,
    locations,
  });
  res.json(tweets);
});

// https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
app.get("/api/user_timeline", async function (req, res) {
  const id_str = req.query.id_str;
  const screen_name = req.query.screen_name;
  const numTweets = req.query.num;
  const mediaType = req.query.mediaType;
  const maxId = req.query.maxId || null;
  const filterFn = getFilterFn({ mediaType });

  const tweets = await getTimeline({
    numTweets,
    filterFn,
    userId: id_str,
    screenName: screen_name,
    maxId,
  });
  res.json(tweets);
});

// https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
app.get("/api/user_likes", async function (req, res) {
  const id_str = req.query.id_str;
  const screen_name = req.query.screen_name;
  const numTweets = req.query.num;
  const mediaType = req.query.mediaType;
  const filterFn = getFilterFn({ mediaType });

  const tweets = await getLikes({
    numTweets,
    filterFn,
    userId: id_str,
    screenName: screen_name,
  });
  res.json(tweets);
});

// https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
app.get("/api/user_info", async function (req, res) {
  const id_str = req.query.id_str;
  const screenName = req.query.screen_name;
  const userInfo = await getUserInfo({
    userId: id_str,
    screenName,
  });
  res.json(userInfo);
});

// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
app.get("/api/search", async function (req, res) {
  const term = req.query.term;
  const numTweets = req.query.num;
  const lang = req.query.lang;
  const mediaType = req.query.mediaType;
  const result_type = req.query.result_type;
  const geocode = req.query.geocode;
  getSearchResults({
    numTweets,
    term,
    lang,
    mediaType,
    result_type,
    geocode,
  })
    .then((tweets) => {
      res.json(tweets && tweets.data.statuses);
    })
    .catch((err) => {
      console.error(err);
      res.json(err);
    });
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
