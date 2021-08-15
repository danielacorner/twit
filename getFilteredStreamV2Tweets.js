// https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Filtered-Stream/filtered_stream.js
const needle = require("needle");
const fetch = require("node-fetch");
const token = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream";
async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules(rules) {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

function streamConnect() {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  return stream;
}

// (async () => {
//   let currentRules;

//   try {
//     // Gets the complete list of rules currently applied to the stream
//     currentRules = await getAllRules();

//     // Delete all rules. Comment the line below if you want to keep your existing rules.
//     await deleteAllRules(currentRules);

//     // Add rules to the stream. Comment the line below if you don't want to add new rules.
//     await setRules();
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   }

//   // Listen to the stream.
//   streamConnect(0);
// })();

// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start
function getFilteredStreamV2Tweets({
  allowedMediaTypes,
  filterLevel,
  countryCode,
  lang,
  numTweets,
}) {
  return new Promise(async (resolve, reject) => {
    // 1. add rules to the stream
    // ! this affects the app for all users
    // * needed one time only?
    // TODO: perform once when the app mounts
    // TODO: if we can only stream one topic at a time, can we save topics and rotate back to them,
    // TODO: then eventually have enough topics stored to allow multiple topics per day

    const rules = [
      {
        value: "covid",
        // value: "dog has:images -is:retweet",
        tag: "covid",
        // tag: "dog pictures",
      },
    ];
    await deleteAllRules({ id: 1426778339046535200, tag: "cat pictures" });

    const rulesResp = setRules(rules);
    console.log("🌟🚨 ~ rulesResp", rulesResp);

    // !! specify rules to retrieve tweets mentioning "covid"
    // * could rotate this topic daily for replay value!
    // Identify and specify which fields you would like to retrieve
    // If you would like to receive additional fields beyond id and text, you will have to specify those fields in your request with the field and/or expansion parameters.
    // https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=created_at
    const query =
      "#nowplaying has:images -is:retweet (horrible OR worst OR sucks OR bad OR disappointing) (place_country:US OR place_country:MX OR place_country:CA) -happy -exciting -excited -favorite -fav -amazing -lovely -incredible";

    const stream = streamConnect();

    const streamedTweets = [];

    stream
      .on("data", (data) => {
        try {
          const json = JSON.parse(data);
          console.log(json);
          streamedTweets.push(json);
          console.log(
            "🌟🚨 ~ .on ~ streamedTweets.length",
            streamedTweets.length
          );
          console.log("🌟🚨 ~ .on ~ numTweets", numTweets);
          if (streamedTweets.length >= numTweets) {
            stream.destroy();
            resolve(streamedTweets);
          }
          // A successful connection resets retry count.
          // retryAttempt = 0;
        } catch (e) {
          if (
            data.detail ===
            "This stream is currently at the maximum allowed connection limit."
          ) {
            console.log(data.detail);
            process.exit(1);
          } else {
            // Keep alive signal received. Do nothing.
          }
        }
      })
      .on("err", (error) => {
        if (error.code !== "ECONNRESET") {
          console.log(error.code);
          process.exit(1);
        } else {
          // This reconnection logic will attempt to reconnect when a disconnection is detected.
          // To avoid rate limits, this logic implements exponential backoff, so the wait time
          // will increase if the client cannot reconnect to the stream.
          // setTimeout(() => {
          //   console.warn("A connection error occurred. Reconnecting...");
          //   streamConnect(++retryAttempt);
          // }, 2 ** retryAttempt);
        }
      });
  });
}

exports.getFilteredStreamV2Tweets = getFilteredStreamV2Tweets;
