const faunadb = require("faunadb");
const q = faunadb.query;

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_DB_KEY || "",
});

function sendBotScoreToDB(nodeWithBotScore) {
  console.log("🌟🚨 ~ sendBotScoreToDB ~ sending node to db");
  faunaClient
    .query(
      q.Create(q.Collection("nodes_with_bot_scores"), {
        data: { nodeWithBotScore },
      })
    )
    .then((ret) => console.log(ret))
    .catch((err) => console.error("Error: %s", err));
}
module.exports = sendBotScoreToDB;
