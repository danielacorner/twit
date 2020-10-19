module.exports = getLikes;
const { T } = require("../utils");
const uniqBy = require("lodash.uniqby");

const MAX_ATTEMPTS = 10;

/** https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list */
async function getLikes({
  userId,
  numTweets,
  screenName,
  filterFn,
  maxId = null,
}) {
  console.log("fetching liked tweets 🐦");

  // if filtering by mediaType, keep fetching until we get that many

  // * current strategy fetches numTweets repeatedly
  // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

  let attempts = 0;
  let fetchedTweets = [];
  let max_id = maxId;

  while (fetchedTweets.length < numTweets && attempts < MAX_ATTEMPTS) {
    attempts++;

    const result = await T.get(`favorites/list`, {
      ...(userId ? { user_id: userId } : {}),
      ...(screenName ? { screen_name: screenName } : {}),
      ...(max_id ? { max_id: Number(max_id) } : {}),
      count: numTweets /*  - fetchedTweets.length */,
      include_rts: true,
      exclude_replies: false,
    });

    if (!result) {
      return [];
    }

    // on the next attempt, fetch tweets older than the oldest one we just fetched
    max_id = result.data.slice(-1)[0].id;

    fetchedTweets = uniqBy(
      [...fetchedTweets, ...result.data.filter(filterFn)],
      (t) => t.id_str
    );
  }

  return fetchedTweets.slice(0, numTweets);
}
