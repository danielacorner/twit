console.log("The bot is starting");
const fs = require("fs");

// https://github.com/ttezel/twit
const Twit = require("twit");

const config = require("./config");
const T = new Twit(config);

// get -> search by hashtag, location, user...

// post -> tweet

// stream
const stream = T.stream("statuses/sample");

let count = 0;

const NUM_TWEETS = 2;

fs.open("./tweets.json", "w", (err, fileDirectory) => {
  if (err) {
    throw "could not open file: " + err;
  }

  stream.on("tweet", function (tweet) {
    count++;

    // stop after a timeout
    // setTimeout(endStream, 5 * 1000);

    // when we see a tweet, save it in an array in "tweets.json"
    // by adding to the end of the array
    // console.log(tweet);

    const string = JSON.stringify(tweet);

    const tweetWithBracket =
      count === 1
        ? `[${string},`
        : count !== NUM_TWEETS
        ? `${string},`
        : `${string}]`;

    // https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
    fs.write(
      fileDirectory,
      tweetWithBracket,
      null,
      "utf8",
      (err, written, string) => {
        console.log("🌟🚨: bytes written:", written);
        if (err) throw err;
        // console.log("saved to tweets.json!");
      }
    );

    // increment the count, and stop eventually
    if (count === NUM_TWEETS) {
      endStream(fileDirectory);
    }
  });
});

function endStream(fd) {
  fs.close(fd, () => {
    console.log("Finished writing to tweets.json");
    process.exit(0);
  });
}
