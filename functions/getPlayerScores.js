const { faunaClient } = require("../populateDB");
const faunadb = require("faunadb");
const q = faunadb.query;

function getPlayerScores() {
  return faunaClient
    .query(q.Get(q.Collection("player_scores")))
    .then((ret) => {
      console.log("🌟🚨 ~ .then ~ ret", ret);
    })
    .catch((err) => console.error("Error: %s", err));
}

function savePlayerScore(playerScore) {
  return faunaClient
    .query(
      q.Create(q.Collection("player_scores"), {
        data: { playerScore },
      })
    )
    .then((ret) => {
      console.log("🌟🚨 ~ .then ~ ret", ret);
    })
    .catch((err) => console.error("Error: %s", err));
}

module.exports = { getPlayerScores, savePlayerScore };
