const express = require("express");
const app = express();
const path = require("path");
const streamTweets = require("./streamTweets");

app.use(express.static(`main`));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.get("/api/stream", async function (req, res) {
  const tweets = await streamTweets({ numTweets: +req.query.num });
  res.json(tweets);
});

app.listen(process.env.PORT || 8080);
