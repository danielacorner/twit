const faunadb = require("faunadb");
const q = faunadb.query;

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_DB_KEY || "",
});

function saveTweetsWithBotScore({ appUserId, allTweetsWithBotScore, refId }) {
  console.log("🌟🚨 ~ saveTweetsWithBotScore ~ sending node to db");

  // save it in the nodes_with_bot_scores collection for later user

  faunaClient
    .query(
      q.Replace(q.Ref(q.Collection("Nodes"), refId), {
        data: { userId: appUserId, nodes: allTweetsWithBotScore },
      })
    )
    .then((ret) => {
      console.log("🌟🚨 ~ q.Replace ~ ret", ret);
    })
    .catch((err) => {
      console.log("🌟🚨 ~ Replace ~ err", err);
    });
}
module.exports = saveTweetsWithBotScore;
