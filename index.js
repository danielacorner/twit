// usage: `node index.js "../src/tweets.json" 100` - generate 100 tweets in ../tweets.json
const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(`main`));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

const { generateNewTweetsDataset } = require("./generateTweetsDataset");
const generateBotScore = require("./generateBotScore");

const FILE_PATH = process.argv[2] || "./tweets.json";
const NUM_TWEETS = Number(process.argv[3]) || 10;

generateNewTweetsDataset({ numTweets: NUM_TWEETS, filePath: FILE_PATH });

// TODO: for each tweet in the dataset, append a bot score
// generateBotScore({id:})
