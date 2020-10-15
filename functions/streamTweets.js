module.exports = streamTweets;
const { T, sentiment } = require("../utils");

// stream -> receive continuously

async function streamTweets({ numTweets, filterFn }) {
  return new Promise((resolve, reject) => {
    const stream = T.stream(`statuses/sample`);

    let count = 0;
    const tweets = [];

    console.log("Streaming tweets 🐦");
    try {
      stream.on("tweet", (tweet) => {
        // if the tweet isn't filtered out...
        if (filterFn && !filterFn(tweet)) {
          return;
        }

        // increment the count
        count++;

        // console log every so often
        // if (count % (filterFn ? 1 : 10) === 0) {
        console.log(`tweets fetched: ${count} - id_str: ${tweet.id_str}`);
        // }

        // ? if too slow, move this to a separate batch request
        // generate sentiment analysis
        const sentimentResult = sentiment.analyze(
          (tweet.extended_tweet || tweet).full_text
        );

        tweets.push({ ...tweet, sentimentResult });

        // stop eventually
        if (count === numTweets) {
          stream.stop();
          resolve(tweets);
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
}
