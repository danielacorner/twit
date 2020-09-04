const { stream } = require("./utils");
const faunadb = require("faunadb");
q = faunadb.query;
require("dotenv").config();

const client = new faunadb.Client({
  secret: process.env.FAUNA_DB_KEY,
});

/** usage:
 * `node populateDB.js 300` - populate with 300 tweets
 */

const numTweetsDefault = 100;
let numTweets = 0;

stream.on("tweet", (tweet) => {
  createTweetInDB(tweet);
  numTweets++;

  const numTweetsFromArgs = process.argv[2];

  if (numTweets >= (numTweetsFromArgs || numTweetsDefault)) {
    console.log(`finished writing ${numTweets} tweets to DB`);
    process.exit(0);
  }
});

function createTweetInDB(tweet) {
  client
    .query(
      q.Create(q.Collection("Tweet"), {
        data: tweet,
      })
    )
    .then((ret) => console.log(ret))
    .catch(console.log);
}
