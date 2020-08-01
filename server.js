const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(`main`));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.get("/api/test", function (req, res) {
  console.log("🌟🚨: req", req);
  res.json({ test: "hi" });
});

app.listen(process.env.PORT || 8080);
