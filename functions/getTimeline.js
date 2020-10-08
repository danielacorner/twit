module.exports = getTimeline;
const { T } = require("../utils");
const uniqBy = require("lodash.uniqby");

const MAX_ATTEMPTS = 10;

/** https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline */
async function getTimeline({ userId, numTweets, screenName, filterFn, maxId }) {
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

      const result = await T.get(`statuses/user_timeline`, {
        ...(userId ? { user_id: userId } : {}),
        ...(screenName ? { screen_name: screenName } : {}),
        ...(max_id ? { max_id } : {}),
        count: numTweets /*  - fetchedTweets.length */,
        include_rts: true,
        exclude_replies: false,
      });

      if (!result) {
        return [];
      }

      // on the next attempt, fetch tweets older than the oldest one we just fetched
      max_id = result.data.reduce(
        (acc, cur) => Math.min(acc, Number(cur.id_str)),
        Infinity
      );

      fetchedTweets = uniqBy(
        [...fetchedTweets, ...result.data.filter(filterFn)],
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
