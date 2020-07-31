console.log("The bot is starting 👋");
const fs = require("fs");
// https://github.com/ttezel/twit
const Twit = require("twit");
const config = require("./config");

const FILE_PATH = "./tweets.json";

const T = new Twit(config);

// get -> search by hashtag, location, user...

// post -> tweet

// stream -> receive continuously
const stream = T.stream("statuses/sample");

let count = 0;
let bytes = 0;

const NUM_TWEETS = 100;

// delete "./tweets.json" file
fs.unlink(FILE_PATH, onDeleted);

function onDeleted(err) {
  console.log(`deleting ${FILE_PATH}`);
  if (err) console.log(err); // if no file found, keep going

  fs.open("./tweets.json", "w", onOpened);
}

// once deleted, open "./tweets.json" file
function onOpened(err, fileDirNum) {
  console.log(`opening ${FILE_PATH}`);
  if (err) throw err;

  stream.on("tweet", (tweet) => onReceiveTweet(tweet, fileDirNum));
}

// when we receive a tweet from the stream,
//
function onReceiveTweet(tweet, fileDirNum) {
  // increment the count
  count++;

  // stringify tweet
  const string = JSON.stringify(tweet);

  // format tweets as an array
  const tweetWithBracket =
    count === 1
      ? `[${string},`
      : count !== NUM_TWEETS
      ? `${string},`
      : `${string}]`;

  // save to "./tweets.json"
  // https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
  fs.write(fileDirNum, tweetWithBracket, null, "utf8", onWriteToFile);

  // stop eventually
  if (count === NUM_TWEETS) {
    endStream(fileDirNum);
  }
}

function onWriteToFile(err, written, string) {
  bytes = bytes + written;
  console.log("🤖: Mb written:", (bytes / 1024 / 1024).toFixed(1));
  if (err) throw err;
}

function endStream(fd) {
  fs.close(fd, () => {
    console.log("Finished writing to tweets.json");
    process.exit(0);
  });
}
