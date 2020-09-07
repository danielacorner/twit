module.exports = getTimeline;
const { T, filterByMediaType } = require("./utils");

const MAX_ATTEMPTS = 10;

async function getTimeline({ userId, numTweets, screenName, mediaType }) {
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
  console.log("fetching timeline tweets 🐦");

  // if filtering by mediaType, keep fetching until we get that many

  // * current strategy fetches numTweets repeatedly
  // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

  let attempts = 0;
  let fetchedTweets = [];
  let since_id = null;

  while (fetchedTweets.length < numTweets && attempts < MAX_ATTEMPTS) {
    attempts++;

    const result = await T.get(`statuses/user_timeline`, {
      ...(userId ? { user_id: userId } : {}),
      ...(screenName ? { screen_name: screenName } : {}),
      ...(since_id ? { since_id } : {}),
      count: numTweets /*  - fetchedTweets.length */,
      include_rts: true,
      exclude_replies: false,
    });

    if (!result) {
      return [];
    }

    // on the next attempt, fetch tweets older than the oldest one we just fetched
    since_id = result.data.slice(-1)[0].id;

    fetchedTweets = [
      ...fetchedTweets,
      ...result.data.filter((node) => filterByMediaType(node, mediaType)),
    ];
  }

  return fetchedTweets.slice(0, numTweets);
}
