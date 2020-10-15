module.exports = getRetweeters;
const { T } = require("../utils");
const uniqBy = require("lodash.uniqby");

const MAX_ATTEMPTS = 10;

/** https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-retweeters-ids */
async function getRetweeters({ tweetId, numTweets, filterFn }) {
  console.log("fetching retweets of a tweet 🐦");

  // if filtering by mediaType, keep fetching until we get that many

  // * current strategy fetches numTweets repeatedly
  // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

  let attempts = 0;
  let fetchedTweets = [];

  while (fetchedTweets.length < numTweets && attempts < MAX_ATTEMPTS) {
    attempts++;

    const result = await T.get(`statuses/retweets/${tweetId}`, {
      // ...(tweetId ? { id: tweetId } : {}),
      count: numTweets /*  - fetchedTweets.length */,
    });

    if (!result || !result.data) {
      return [];
    }

    fetchedTweets = uniqBy(
      [...fetchedTweets, ...result.data.filter(filterFn)],
      (t) => t.id_str
    );
  }

  return fetchedTweets.slice(0, numTweets);
}
