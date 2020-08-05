module.exports = getTimeline;
const { T, sentiment } = require("./utils");

async function getTimeline({ userId, numTweets }) {
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
  console.log("fetching timeline tweets 🐦");
  const result = await T.get(`statuses/user_timeline`, {
    user_id: userId,
    count: numTweets,
    include_rts: true,
    exclude_replies: false,
  });
  return result;
}
