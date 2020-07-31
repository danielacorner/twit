const generateNewTweetsDataset = require("./generateTweetsDataset");

const FILE_PATH = "./tweets.json";
const NUM_TWEETS = 100;

generateNewTweetsDataset({ numTweets: NUM_TWEETS, filePath: FILE_PATH });
