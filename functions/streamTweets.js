module.exports = streamTweets;
const { T, sentiment } = require("../utils");

/** set the filters for twitter filtered stream v2 API https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start */
function setStreamFilters() {
  fetch("https://api.twitter.com/2/tweets/search/stream/rules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TWITTER_ACCESS_TOKEN_SECRET}`,
      // "Authorization": `Bearer ${T.getBearerToken()}`
    },
    body: `{
      "add": [
        {"value": "cat has:images", "tag": "cats with images"}
      ]
    }`,
  });
}

// stream -> receive continuously
async function streamTweets({ numTweets, filters }) {
  console.log("🌟🚨 ~ streamTweets ~ numTweets", numTweets);
  return new Promise((resolve, reject) => {
    // TODO: pass filter into stream v2 https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start
    const stream = T.stream(`statuses/sample`);

    setStreamFilters(filters).then((resp) => {});

    let count = 0;
    let attempts = 0;
    const maxAttemps = numTweets * 2;
    const tweets = [];

    console.log("Streaming tweets 🐦");
    try {
      stream.on("tweet", (tweet) => {
        attempts++;
        console.log("🌟🚨 ~ stream.on ~ tweet", tweet.id_str);
        // if the tweet isn't filtered out...
        const filteredOut = filterFn && !filterFn(tweet);
        console.log("🌟🚨 ~ stream.on ~ filteredOut", filteredOut);
        console.log("🌟🚨 ~ stream.on ~ filterFn", filterFn.toString());
        if (filteredOut) {
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
        if (count === numTweets || attempts >= maxAttemps) {
          stream.stop();
          resolve(tweets);
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
}
