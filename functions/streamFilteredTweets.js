module.exports = streamFilteredTweets;
const { T, sentiment } = require("../utils");

// filter -> fetch with filters (location, users, etc)

/** https://developer.twitter.com/en/docs/twitter-api/v1/tweets/filter-realtime/api-reference/post-statuses-filter */
async function streamFilteredTweets({ numTweets, filterFn, locations }) {
  return new Promise((resolve, reject) => {
    const stream = T.stream(`statuses/filter`, {
      // Each bounding box should be specified as a pair of longitude and latitude pairs, with the southwest corner of the bounding box coming first.
      // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/filter-realtime/guides/basic-stream-parameters
      ...(locations
        ? {
            locations,
          }
        : {}),
    });
    let count = 0;
    const tweets = [];

    console.log("Streaming filtered tweets 🐦");

    // if filtering by mediaType, keep fetching until we get that many

    stream.on("tweet", (tweet) => {
      // if the tweet isn't filtered out...
      if (filterFn && !filterFn(tweet)) {
        return;
      }

      // increment the count
      count++;

      // console log every so often
      if (count % (filterFn ? 1 : 10) === 0) {
        console.log(`tweets fetched: ${count}, need: ${numTweets}`);
      }

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
  });
}
