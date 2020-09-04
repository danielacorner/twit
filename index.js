// usage: `node index.js "../src/tweets.json" 100` - generate 100 tweets in ../tweets.json

const { generateNewTweetsDataset } = require("./generateTweetsDataset");
const generateBotScore = require("./generateBotScore");

const FILE_PATH = process.argv[2] || "./tweets.json";
const NUM_TWEETS = Number(process.argv[3]) || 10;
console.log("🌟🚨: NUM_TWEETS", NUM_TWEETS);
console.log("🌟🚨: FILE_PATH", FILE_PATH);

generateNewTweetsDataset({ numTweets: NUM_TWEETS, filePath: FILE_PATH });

// TODO: for each tweet in the dataset, append a bot score
// generateBotScore({id:})
