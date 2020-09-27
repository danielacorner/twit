module.exports = getTweets;
const { T } = require("../utils");

/** https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline */
async function getTweets(ids) {
  console.log("fetching tweets by id 🐦");
  console.log(ids);

  // if filtering by mediaType, keep fetching until we get that many

  // * current strategy fetches numTweets repeatedly
  // * could also fetch *remaining* numTweets repeatedly for faster results with greater API usage & number of attempts

  const tweetsResponses = await Promise.allSettled(
    ids.map((id) => T.get(`statuses/show/${id}`))
  );

  const tweets = tweetsResponses
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  return tweets;
}
