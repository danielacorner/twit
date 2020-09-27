module.exports = generateSentimentScore;

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

function generateSentimentScore(text) {
  return sentiment.analyze(text);
}
