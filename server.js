const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const streamTweets = require("./functions/streamTweets");
const { FILTER_LEVEL, filterByMediaType } = require("./utils");
const getTimeline = require("./functions/getTimeline");
const getSearchResults = require("./functions/getSearchResults");
const getUserInfo = require("./functions/getUserInfo");
const streamFilteredTweets = require("./functions/streamFilteredTweets");
const getTweets = require("./functions/getTweets");
const getLikes = require("./functions/getLikes");
const getUserMentions = require("./functions/getUserMentions");
const generateBotScore = require("./functions/generateBotScore");
const getRetweeters = require("./functions/getRetweeters");

app.use(express.static(`main`));
app.use(bodyParser.json());

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
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
  const countryCode = req.query.countryCode;
  const lang = req.query.lang;
  const filterFn = getFilterFn({
    allowedMediaTypes,
    filterLevel,
    countryCode,
    lang,
  });

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
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
  const filterFn = getFilterFn({ allowedMediaTypes });

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
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
  const maxId = req.query.max_id || null;
  const filterFn = getFilterFn({ allowedMediaTypes });

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
  const max_id = req.query.max_id;
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");

  const filterFn = getFilterFn({ allowedMediaTypes });

  const tweets = await getLikes({
    numTweets,
    filterFn,
    userId: id_str,
    screenName: screen_name,
    maxId: max_id,
  });
  res.json(tweets);
});

// https://rapidapi.com/OSoMe/api/botometer-pro/endpoints
app.post("/api/generate_bot_score", async function (req, res) {
  const tweetsByUser = req.body;

  const {
    astroturf,
    fake_follower,
    financial,
    other,
    overall,
    self_declared,
    spammer,
  } = await generateBotScore(tweetsByUser);

  //       Bot types:

  // fake_follower: bots purchased to increase follower counts
  // self_declared: bots from botwiki.org
  // astroturf: manually labeled political bots and accounts involved in follow trains that systematically delete content
  // spammer: accounts labeled as spambots from several datasets
  // financial: bots that post using cashtags
  // other: miscellaneous other bots obtained from manual annotation, user feedback, etc.

  res.json({
    astroturf,
    fake_follower,
    financial,
    other,
    overall,
    self_declared,
    spammer,
  });
});

// https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
// https://stackoverflow.com/questions/2693553/replies-to-a-particular-tweet-twitter-api
//
// since we can only fetch from statuses/mentions_timeline,
// we'll fetch all the replies to this user
// * (later we could filter out other replies to this user, leaving only the ones to this tweet)
// app.get("/api/user_mentions", async function (req, res) {
//   const id_str = req.query.id_str;
//   const screen_name = req.query.screen_name;
//   const numTweets = req.query.num;
//   const allowedMediaTypes =
//     req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");

//   const filterFn = getFilterFn({ allowedMediaTypes });

//   const tweets = await getUserMentions({
//     numTweets,
//     filterFn,
//     userId: id_str,
//     screenName: screen_name,
//   });
//   res.json(tweets);
// });

// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-retweeters-ids
// get users who retweeted a tweet id
app.get("/api/retweets", async function (req, res) {
  // working example:
  // const id_str = "1316624321754796034";
  const id_str = req.query.id_str;
  console.log("🌟🚨: id_str", id_str);
  const screen_name = req.query.screen_name;
  const numTweets = req.query.num;
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");

  const filterFn = getFilterFn({ allowedMediaTypes });

  const tweets = await getRetweeters({
    numTweets,
    filterFn,
    tweetId: id_str,
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
  const allowedMediaTypes =
    req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
  const result_type = req.query.result_type;
  const geocode = req.query.geocode;
  getSearchResults({
    numTweets,
    term,
    lang,
    allowedMediaTypes,
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

app.listen(process.env.PORT || 8080, () => {
  console.log("server listening on port " + (process.env.PORT || 8080));
});

// tweet object
// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object
function getFilterFn({ allowedMediaTypes, filterLevel, countryCode, lang }) {
  return (node) =>
    filterByMediaType(node, allowedMediaTypes, filterLevel) &&
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
