const { faunaClient } = require("../faunaClient");
const faunadb = require("faunadb");
const q = faunadb.query;

function getPlayerScores() {
  return faunaClient
    .query(q.Get(q.Collection("player_scores")))
    .then((ret) => {
      console.log("🌟 ~ .then ~ ret", ret);
      return ret.data;
    })
    .catch((err) => console.error("Error: %s", err));
}

function savePlayerScore({ userId, name, score }) {
  console.log("🌟 ~ savePlayerScore ~ { userId, name, score }", {
    userId,
    name,
    score,
  });
  return (
    faunaClient
      .query(
        q.Create(q.Collection("player_scores"), {
          data: { userId, name, score },
        })
      )
      // TODO: bad ref?
      .then((ret) => {
        console.log("🌟 ~ .then ~ ret", ret);
        return ret.data;
      })
      .catch((err) => console.error("Error: %s", err))
  );
}

module.exports = { getPlayerScores, savePlayerScore };
