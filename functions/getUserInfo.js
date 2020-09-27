module.exports = getUserInfo;
const { T } = require("../utils");

// https://www.npmjs.com/package/twit
async function getUserInfo({ userId, screenName }) {
  // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
  console.log("fetching user info 👩‍🔬");
  const result = await T.get(`users/show`, {
    user_id: userId,
    screen_name: screenName,
    include_entities: true,
  });
  return result;
}
