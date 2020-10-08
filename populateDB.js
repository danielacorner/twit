const { stream } = require("./utils");
const faunadb = require("faunadb");
q = faunadb.query;
require("dotenv").config();

/** usage:
 * `node populateDB.js 300` - populate with 300 tweets
 */

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_DB_KEY,
});

deleteAllTweetsInDB().then((ret) => {
  console.log("deleted all tweets");
  streamTweetsIntoDB();
});

function streamTweetsIntoDB() {
  const numTweetsDefault = 10;
  const numTweetsFromArgs = process.argv[2];
  let numTweets = 0;

  stream.on("tweet", (tweet) => {
    createTweetInDB(tweet).then((ret) => {
      numTweets++;
    });

    if (numTweets >= (numTweetsFromArgs || numTweetsDefault)) {
      console.log(`finished writing ${numTweets} tweets to DB`);
      process.exit(0);
    }
  });
}

// TODO: switch to creating several posts
// https://docs.fauna.com/fauna/current/tutorials/crud?lang=javascript#create-several-posts
function createTweetInDB(tweet) {
  return faunaClient
    .query(
      q.Create(q.Collection("Tweet"), {
        data: tweet,
      })
    )
    .catch(console.error);
}

function deleteAllTweetsInDB() {
  return faunaClient.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection("Tweet"))),
      q.Lambda((x) => q.Delete(x))
    )
  );
}
