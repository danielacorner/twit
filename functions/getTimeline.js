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
async function getTimeline({ userId, numTweets, screenName, filterFn, maxId }) {
  if (!userId) {
    console.log("🤡 no userId!");
    return;
  }
  try {
    console.log("fetching timeline tweets 🐦");

    // if filtering by mediaType, keep fetching until we get that many

    // * current strategy fetches numTweets repeatedly
    // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

    let attempts = 0;
    let fetchedTweets = [];
    let max_id = maxId || null;

    while (fetchedTweets.length < numTweets && attempts < MAX_ATTEMPTS) {
      attempts++;

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
      const max_results = Math.min(5, Math.max(numTweets, 100));
      const timelineUrl = `https://api.twitter.com/2/users/${userId}/tweets${queryString}&max_results=${max_results}`;
      console.log("🌟🚨 ~ getTimeline ~ timelineUrl", timelineUrl);

      const response = await needle("get", timelineUrl, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.body.errors) {
        console.log(
          "🌟🚨 ~ getTimeline ~ response.title,.detail",
          response.title,
          response.detail
        );
        console.log("🌟🚨 ~ getTimeline ~ response.body", response.body);
        return [];
      } else {
        console.log("🌟🚨 ~ getTimeline ~ response", Object.keys(response));
        console.log("🌟🚨 ~ getTimeline ~ response.body", response.body);
        // console.log("🌟🚨 ~ getTimeline ~ response", response);
      }

      // const result = await T.get(`statuses/user_timeline`, {
      //   ...(userId ? { user_id: userId } : {}),
      //   ...(screenName ? { screen_name: screenName } : {}),
      //   ...(max_id ? { max_id } : {}),
      //   count: numTweets /*  - fetchedTweets.length */,
      //   include_rts: true,
      //   exclude_replies: false,
      // });

      if (!response) {
        return [];
      }

      // on the next attempt, fetch tweets older than the oldest one we just fetched
      // max_id = response.body.data.reduce(
      //   (acc, cur) => Math.min(acc, Number(cur.id_str)),
      //   Infinity
      // );

      fetchedTweets = uniqBy(
        [
          ...fetchedTweets,
          ...response.body.data.filter(filterFn ? filterFn : () => true),
        ],
        (t) => t.id_str
      );
      console.log("🌟: getTimeline -> fetchedTweets", fetchedTweets.length);
    }

    return fetchedTweets.slice(0, numTweets);
  } catch (err) {
    console.log(err);
    return err;
  }
}
