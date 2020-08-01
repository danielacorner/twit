module.exports = generateNewTweetsDataset;

const fs = require("fs");
const { config } = require("./config");

const Twit = require("twit");
// https://github.com/ttezel/twit
const T = new Twit(config);

// stream -> receive continuously
const stream = T.stream("statuses/sample");

let count = 0;
let bytes = 0;

function generateNewTweetsDataset({ numTweets, filePath }) {
  console.log("The bot is starting 👋");
  // delete "./tweets.json" file
  console.log(`deleting file`);

  fs.unlink(filePath, (err) => onDeleted(err, filePath, numTweets));
}

function onDeleted(err, filePath, numTweets) {
  if (err) console.log(err); // if no file found, keep going

  console.log(`opening file ${filePath}`);
  fs.open(filePath, "w", (err, fileDirNum) =>
    onOpened(err, fileDirNum, numTweets)
  );
}

// once deleted, open "./tweets.json" file
function onOpened(err, fileDirNum, numTweets) {
  if (err) throw err;

  stream.on("tweet", (tweet) => onReceiveTweet(tweet, fileDirNum, numTweets));
}

// when we receive a tweet from the stream,
//
function onReceiveTweet(tweet, fileDirNum, numTweets) {
  // increment the count
  count++;

  // stringify tweet
  const string = JSON.stringify(tweet);

  // format tweets as an array
  const tweetWithBracket =
    count === 1
      ? `[${string},`
      : count !== numTweets
      ? `${string},`
      : `${string}]`;

  // save to "./tweets.json"
  // https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
  fs.write(fileDirNum, tweetWithBracket, null, "utf8", onWriteToFile);

  // stop eventually
  if (count === numTweets) {
    endStream(fileDirNum);
  }
}

let prevMb = 0;
function onWriteToFile(err, written, string) {
  bytes = bytes + written;
  const mb = (bytes / 1024 / 1024).toFixed(1);
  if (prevMb !== mb) {
    console.log("🤖: Mb written:", mb);
    prevMb = mb;
  }
  if (err) throw err;
}

function endStream(fd) {
  fs.close(fd, () => {
    console.log("Finished writing to tweets.json");
    process.exit(0);
  });
}
