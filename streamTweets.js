module.exports = streamTweets;

const { config } = require("./config");

const Twit = require("twit");
// https://github.com/ttezel/twit
const T = new Twit(config);

// stream -> receive continuously
const stream = T.stream("statuses/sample");

async function streamTweets({ numTweets }) {
  let count = 0;
  return new Promise((resolve, reject) => {
    const tweets = [];
    console.log("Streaming tweets 🐦");
    // delete "./tweets.json" file
    stream.on("tweet", (tweet) => {
      // increment the count
      count++;

      tweets.push(tweet);

      // stop eventually
      if (count === numTweets) {
        stream.stop();
        resolve(tweets);
      }
    });
  });
}
