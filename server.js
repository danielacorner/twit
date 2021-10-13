const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const { FILTER_LEVEL, filterByMediaType } = require("./utils");
const getTimeline = require("./functions/getTimeline");
const getSearchResults = require("./functions/getSearchResults");
const getUserInfo = require("./functions/getUserInfo");
const streamFilteredTweets = require("./functions/streamFilteredTweets");
const getTweets = require("./functions/getTweets");
const getLikes = require("./functions/getLikes");
// const getUserMentions = require("./functions/getUserMentions");
const generateBotScore = require("./functions/generateBotScore");
const getRetweeters = require("./functions/getRetweeters");
const sendBotScoreToDB = require("./functions/sendBotScoreToDB");
const saveTweetsWithBotScore = require("./functions/saveTweetsWithBotScore");
const {
	getPlayerScores,
	savePlayerScore,
} = require("./functions/getPlayerScores");
const {
	getFilteredStreamV2Tweets,
} = require("./functions/getFilteredStreamV2Tweets");

const ALLOW_LIST = [
	"https://botsketball.com",
	"https://botsketball.com/",
	"https://www.botsketball.com",
	"https://www.botsketball.com/",
	"https://botsketball.netlify.app",
	"https://botsketball.netlify.app/",
	"https://twitter-viz.netlify.app",
	"https://twitter-viz.netlify.app/",
	"http://localhost:3000",
	"http://localhost:3000/",
]; /*
app.use(
  cors({
    origin: ALLOW_LIST,
  })
); */
app.use(cors());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
	);
	next();
});
app.use(express.static(`main`));

app.use(bodyParser.json());

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
});

// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/sample-realtime/overview/get_statuses_sample
app.get("/api/stream", async function (req, res) {
	try {
		const filterLevel = req.query.filterLevel;
		console.log("🌟 ~ filterLevel", filterLevel);
		const allowedMediaTypes =
			req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
		console.log("🌟 ~ allowedMediaTypes", allowedMediaTypes);
		const countryCode = req.query.countryCode;
		console.log("🌟 ~ countryCode", countryCode);
		const lang = req.query.lang;
		console.log("🌟 ~ lang", lang);
		const numTweets = 10;
		const {
			data: tweets,
			error,
			msUntilRateLimitReset,
		} = await getFilteredStreamV2Tweets({
			allowedMediaTypes,
			filterLevel,
			countryCode,
			lang,
			numTweets,
		});
		console.log("🌟 ~ tweets", tweets && tweets.length);
		console.log("🌟🚨 ~ msUntilRateLimitReset", msUntilRateLimitReset);
		console.log("🌟🚨🌟🚨🌟🚨🌟🚨🌟🚨 ~ RESPONSE", msUntilRateLimitReset);
		res.json({ data: tweets, error, msUntilRateLimitReset });
	} catch (e) {
		console.log(
			`⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    err`,
			e
		);
		res.json({ data: null, error: e, msUntilRateLimitReset: null });
	}
});

app.get("/api/get", async function (req, res) {
	const ids = req.query.ids.split(",");

	const tweets = await getTweets(ids).catch((err) => console.log(err));

	res.json(tweets);
});

// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/filter-realtime/api-reference/post-statuses-filter
// app.get("/api/filter", async function (req, res) {
// 	const locations = req.query.locations;
// 	const allowedMediaTypes =
// 		req.query.allowedMediaTypes && req.query.allowedMediaTypes.split(",");
// 	const filterFn = getFilterFn({ allowedMediaTypes });

// 	const tweets = await streamFilteredTweets({
// 		numTweets: +req.query.num,
// 		filterFn,
// 		locations,
// 	});
// 	res.json(tweets);
// });

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

app.post("/api/save_bot_score_for_current_app_user", async function (req, res) {
	const { appUserId, allTweetsWithBotScore, refId } = req.body;

	await saveTweetsWithBotScore({ appUserId, allTweetsWithBotScore, refId });

	res.json({ success: true });
});

// https://rapidapi.com/OSoMe/api/botometer-pro/endpoints
app.post("/api/generate_bot_score", async function (req, res) {
	const tweetsByUser = req.body;

	const botScore = await generateBotScore(tweetsByUser);

	const {
		astroturf,
		fake_follower,
		financial,
		other,
		overall,
		self_declared,
		spammer,
	} = botScore;
	//       Bot types:

	// fake_follower: bots purchased to increase follower counts
	// self_declared: bots from botwiki.org
	// astroturf: manually labeled political bots and accounts involved in follow trains that systematically delete content
	// spammer: accounts labeled as spambots from several datasets
	// financial: bots that post using cashtags
	// other: miscellaneous other bots obtained from manual annotation, user feedback, etc.

	// whenever we generate a bot score
	// send bot score to DB, so we can reliably display nodes with bot scores (botometer api limit)
	// https://docs.fauna.com/fauna/current/cookbook/?lang=javascript#collection-create-document
	sendBotScoreToDB({ ...tweetsByUser[0], botScore });

	res.json(botScore);
});

app.get("/api/highscores", async function (req, res) {
	const highScores = await getPlayerScores();

	res.json(highScores);
});
app.post("/api/save_highscore", async function (req, res) {
	const { userId, name, score } = req.body;
	console.log("🌟 ~ { userId, name, score }", { userId, name, score });
	const response = await savePlayerScore({ userId, name, score });
	console.log("🌟 ~ sabehighscore response", response);

	res.json(response);
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
	console.log("🌟: id_str", id_str);
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
		(!allowedMediaTypes ||
			filterByMediaType(node, allowedMediaTypes, filterLevel)) &&
		(!filterLevel || filterByQualityLevel(node, filterLevel)) &&
		(!countryCode || filterByLocation(node, countryCode)) &&
		(!lang || filterByLang(node, lang));
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

function getOriginalPoster(tweet /* : Tweet */) /* : User | null */ {
	const retweetedUser = getRetweetedUser(tweet);
	const originalPoster = retweetedUser ? retweetedUser : tweet && tweet.user;
	return originalPoster;
}
function getRetweetedUser(tweet /* : Tweet */) /* : User | null */ {
	return (
		(tweet && tweet.retweeted_status && tweet.retweeted_status.user) || null
	);
}
