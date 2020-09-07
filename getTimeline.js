module.exports = getTimeline;
const { T } = require("./utils");

async function getTimeline({ userId, numTweets, screenName }) {
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
  console.log("fetching timeline tweets 🐦");
  const result = await T.get(`statuses/user_timeline`, {
    ...(userId ? { user_id: userId } : {}),
    ...(screenName ? { screen_name: screenName } : {}),
    count: numTweets,
    include_rts: true,
    exclude_replies: false,
  });
  return result ? result.data : [];
}
