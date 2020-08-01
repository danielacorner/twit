module.exports = streamTweets;

const { config } = require("./config");

const Twit = require("twit");
// https://github.com/ttezel/twit
const T = new Twit(config);

// stream -> receive continuously

async function streamTweets({ numTweets }) {
  return new Promise((resolve, reject) => {
    const stream = T.stream("statuses/sample");
    let count = 0;
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
