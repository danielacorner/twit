// https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Filtered-Stream/filtered_stream.js
const needle = require("needle");
const token = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
// https://developer.twitter.com/en/docs/twitter-api/data-dictionary/object-model/tweet
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/api-reference/get-tweets-search-stream
const tweetFields = [
  "attachments",
  "author_id",
  "context_annotations",
  "conversation_id",
  "created_at",
  "entities",
  "geo",
  "id",
  "in_reply_to_user_id",
  "lang",
  "public_metrics",
  "possibly_sensitive",
  "referenced_tweets",
  "reply_settings",
  "source",
  "text",
  "withheld",
];
const userFields = [
  "created_at",
  "description",
  "entities",
  "id",
  "location",
  "name",
  "pinned_tweet_id",
  "profile_image_url",
  "protected",
  "public_metrics",
  "url",
  "username",
  "verified",
  "withheld",
];
const mediaFields = [
  "duration_ms",
  "height",
  "media_key",
  "preview_image_url",
  "type",
  "url",
  "width",
  "public_metrics",
  "alt_text",
];
const placeFields = [
  "contained_within",
  "country",
  "country_code",
  "full_name",
  "geo",
  "id",
  "name",
  "place_type",
];
// poll.fields

const tweetExpansions = [
  "author_id",
  "referenced_tweets.id",
  // "attachments.poll_ids",
  // "attachments.media_keys",
  // "entities.mentions.username",
  // "geo.place_id", "in_reply_to_user_id",
  "referenced_tweets.id.author_id",
];

const queryParams = [
  { key: "tweet.fields", val: tweetFields.join(",") },
  { key: "expansions", val: tweetExpansions.join(",") },
  { key: "user.fields", val: userFields.join(",") },
  { key: "media.fields", val: mediaFields.join(",") },
  { key: "place.fields", val: placeFields.join(",") },
];
const queryString = `?${queryParams
  .map(({ key, val }) => `${key}=${val}`)
  .join("&")}`;
const streamURL = `https://api.twitter.com/2/tweets/search/stream${queryString}`;

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
    console.log("rules.data must be an array");
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

/** rate limits: https://developer.twitter.com/en/docs/twitter-api/rate-limits#v2-limits */
// *** requests per 15 minute window
// * Tweet lookup	- 300
// * Search Tweets
// * - Recent - 450
// * - Full-archive - 300
// * Filtered stream
// * - Connecting - 50
// * - Adding/deleting filters - 450
// * - Listing filters - 450
// * Sampled stream	- 50
// * etc
// * User lookup	- 300
function getStream() {
  const stream = needle.get(
    streamURL,
    {
      headers: {
        "User-Agent": "v2FilterStreamJS",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    },
    function (error, response) {
      if (!error && response.statusCode === 200) {
        console.log("🌟 ~ getStream", response.statusCode);
      } else {
        console.log("🚨🚨🚨 ~ getStream ~ response.code", response.code);
        console.log("🚨🚨🚨 ~ getStream ~ response.body", response.body);
      }
    }
  );

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

    // const deleteResp = await deleteAllRules({
    //   data: [
    //     {
    //       id: 1426778339046535200,
    //       tag: "cat pictures",
    //     },
    //   ],
    // });

    const rules = [
      {
        value: "covid",
        // value: "dog has:images -is:retweet",
        tag: "covid",
        // tag: "dog pictures",
      },
    ];
    // ! setRules only needed once
    // const rulesResp = await setRules(rules);

    // !! specify rules to retrieve tweets mentioning "covid"
    // * could rotate this topic daily for replay value!
    // Identify and specify which fields you would like to retrieve
    // If you would like to receive additional fields beyond id and text, you will have to specify those fields in your request with the field and/or expansion parameters.
    // https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=created_at

    // const query =
    //   "#nowplaying has:images -is:retweet (horrible OR worst OR sucks OR bad OR disappointing) (place_country:US OR place_country:MX OR place_country:CA) -happy -exciting -excited -favorite -fav -amazing -lovely -incredible";

    streamConnectStartFetching({ numTweets, resolve, retryAttempt: 0 });
  });
}

exports.getFilteredStreamV2Tweets = getFilteredStreamV2Tweets;

function streamConnectStartFetching({ numTweets, resolve, retryAttempt }) {
  const stream = getStream();
  const streamedTweets = [];
  console.log(
    "🌟 261 ~ returnnewPromise ~ streamedTweets",
    streamedTweets.length
  );
  stream
    .on("data", (data) => {
      try {
        const json = JSON.parse(data);
        console.log("🐦 tweet!");
        // console.log(json);
        streamedTweets.push(json);
        if (streamedTweets.length >= numTweets) {
          // stop streaming
          stream.destroy();

          const streamedTweetsData = streamedTweets.map(mapStreamedTweets);
          console.log("done! stream destroyed ✔💣");
          resolve(streamedTweetsData);
        }
        // A successful connection resets retry count.
      } catch (e) {
        // // stop streaming
        console.log("🌟 ~ .on ~ data.code", data.code);
        console.log("🌟 ~ .on ~ data.title", data.title);
        console.log("🌟 ~ .on ~ data.detail", data.detail);

        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          stream.destroy();
          console.log(
            "🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟"
          );
          setTimeout(() => {
            console.warn("A connection error occurred. Reconnecting...");
            streamConnectStartFetching({
              numTweets,
              resolve,
              retryAttempt: ++retryAttempt,
            });
          }, 2 ** retryAttempt);
          // process.exit(1);
        }
      }
    })
    .on("err", (error) => {
      stream.destroy();

      console.log("error.code", error.code);
      console.log("error.title", error.title);
      if (error.code !== "ECONNRESET") {
        process.exit(1);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnectStartFetching({
            numTweets,
            resolve,
            retryAttempt: ++retryAttempt,
          });
        }, 2 ** retryAttempt);
      }
    });
}

function mapStreamedTweets({ matching_rules, data: tweet, includes }) {
  // * d.includes =>  The ID that represents the expanded data object will be included directly in the Tweet data object,
  // * the expanded object metadata will be returned within the includes response object,
  // * and will also include the ID so that you can match this data object to the original Tweet object.
  const user = includes.users
    ? includes.users.find((user) => user.id === tweet.author_id)
    : tweet.user;
  const fullTweet = includes.tweets // replace truncated text with full text
    ? includes.tweets.find((t) => {
        const isThisTweet = t.id === tweet.id;
        const retweetedTweetMeta = tweet.referenced_tweets.find(
          (rt) => rt.type === "retweeted"
        );
        const isRetweetedTweet =
          retweetedTweetMeta && t.id === retweetedTweetMeta.id;
        return isThisTweet || isRetweetedTweet;
      })
    : {};

  if (fullTweet) {
    console.log("🌟 ~ .on ~ fullTweet found!", fullTweet.id);
  } else {
    console.log("🌟 ~ not found...");
    console.log("🌟 ~ tweet", tweet);
    console.log("🌟 ~ .on ~ includes.tweets", includes.tweets);
    // console.log(
    //   "🌟 ~ .on ~ includes.tweets",
    //   includes.tweets && includes.tweets.map((t) => t.id)
    // );
  }

  // console.log("🌟 ~ .on ~ includes", Object.keys(includes));
  // console.log(
  //   "🌟 ~ .on ~ includes.tweets",
  //   includes.tweets.map((t) => Object.keys(t))
  //   );
  // console.log("🌟 ~ .on ~ tweet.id", tweet.id);
  return {
    ...tweet,
    ...fullTweet,
    user,
    includes,
    matching_rules,
  };
}
