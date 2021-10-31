module.exports = getTimeline;
const { T } = require("../utils");
const uniqBy = require("lodash.uniqby");
const needle = require("needle");
const {
  getTwitterApiUrlQueryStringForTimeline,
} = require("./getTwitterApiUrlQueryString");
const token = process.env.TWITTER_BEARER_TOKEN;

const MAX_ATTEMPTS = 10;

/** https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline */
async function getTimeline({
  user,
  numTweets,
  screenName,
  filterFn,
  maxId,
  needsV1Api = false,
}) {
  const userId = user.id_str || String(user.id);
  if (!userId) {
    console.log("🤡 no userId!");
    return;
  }
  try {
    console.log("fetching timeline tweets 🐦 for userId ", userId);

    // if filtering by mediaType, keep fetching until we get that many

    // * current strategy fetches numTweets repeatedly
    // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

    let attempts = 0;
    let fetchedTweets = [];
    let max_id = maxId || null;

    // while (fetchedTweets.length < numTweets && attempts < MAX_ATTEMPTS) {
    //   attempts++;
    // console.log("🌟🚨 ~ attempts", attempts);
    console.log("🌟🚨 ~ fetchedTweets.length", fetchedTweets.length);
    console.log("🌟🚨 ~ numTweets", numTweets);

    // const queryParams = [
    //   { key: "tweet.fields", val: tweetFields.join(",") },
    //   { key: "expansions", val: tweetExpansions.join(",") },
    //   { key: "user.fields", val: userFields.join(",") },
    //   { key: "media.fields", val: mediaFields.join(",") },
    //   { key: "place.fields", val: placeFields.join(",") },
    // ];
    // const queryString = `?${queryParams
    //   .map(({ key, val }) => `${key}=${val}`)
    //   .join("&")}`;
    const queryString = getTwitterApiUrlQueryStringForTimeline();
    const MAX_TWEETS_PER_FETCH = 200;
    const max_results = Math.min(
      MAX_TWEETS_PER_FETCH,
      numTweets || numTweets === 0 ? numTweets : 100
    );
    const timelineUrl = needsV1Api
      ? `https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=${userId}&count=${max_results}`
      : `https://api.twitter.com/2/users/${userId}/tweets${queryString}&max_results=${max_results}`;
    console.log("🌟🚨 ~ getTimeline ~ timelineUrl", timelineUrl);

    const response = await needle("get", timelineUrl, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (!response) {
      console.log("! response", response);
      return [];
    }
    if (response.body.errors) {
      console.log(
        "🌟🚨 ~ getTimeline ~ response.title,.detail",
        response.title,
        response.detail
      );
      // console.log("🌟🚨 ~ getTimeline ~ response.body", response.body);
      return [];
    }
    console.log(
      "🌟🚨 ~ getTimeline response.body.length",
      response.body && response.body.length
    );

    // const result = await T.get(`statuses/user_timeline`, {
    //   ...(userId ? { user_id: userId } : {}),
    //   ...(screenName ? { screen_name: screenName } : {}),
    //   ...(max_id ? { max_id } : {}),
    //   count: numTweets /*  - fetchedTweets.length */,
    //   include_rts: true,
    //   exclude_replies: false,
    // });

    // on the next attempt, fetch tweets older than the oldest one we just fetched
    // max_id = response.body.data.reduce(
    //   (acc, cur) => Math.min(acc, Number(cur.id_str)),
    //   Infinity
    // );

    fetchedTweets = uniqBy(
      [
        ...fetchedTweets,
        ...(Array.isArray(response.body) && response.body.filter && filterFn
          ? response.body.filter(filterFn ? filterFn : () => true)
          : response.body),
      ],
      (t) => t.id_str
    );
    console.log(
      "🌟: getTimeline -> fetchedTweets.length",
      fetchedTweets.length
    );
    // }

    return fetchedTweets.map((t) => ({ ...t, user })).slice(0, numTweets);
  } catch (err) {
    console.log(err);
    return err;
  }
}
