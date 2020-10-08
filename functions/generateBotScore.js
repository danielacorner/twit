module.exports = generateBotScore;

const { config, rapidapi_key } = require("../config");
const unirest = require("unirest");
const Twit = require("twit");
const fs = require("fs");

// https://github.com/ttezel/twit
const T = new Twit(config);

// usage:
// generateBotScore({ /* id: "888047946876542976",  */ name: "danielacorner" }); // * use id_str not id from tweet's user data

// Twitter API reference https://developer.twitter.com/en/docs/api-reference-index

// getTimeline({
//   id: "888047946876542976",
//   callback: (err, data, response) => {
//     console.log("status: ", response.statusCode);
//     if (err) throw err;
//   },
// });
function getTimeline({ id, name, callback }) {
  T.get(
    "statuses/user_timeline", // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
    {
      ...(id ? { user_id: id } : {}),
      ...(name ? { screen_name: name } : {}),
    },
    callback
  );
}

// https://botometer.iuni.iu.edu/#!/api
/** uses the Botometer API to generate probability 0-1 that account is a bot
 * @param id user id
 * @param name username (twitter handle)
 */
function generateBotScore({ id, name }) {
  // Botometer API requires a scraped timeline of tweets
  getTimeline({
    id,
    name,
    callback: (err, data, response) => {
      // getTimeline only requires id OR name,
      // but requestBotometerScore requires both
      // so populate whichever is missing using the data

      // first tweet result contains user info
      const tweet = data[0];
      const idFromDatum = tweet.user.id_str;
      const nameFromDatum = tweet.user.screen_name;

      onReceiveTimeline(err, data, response, {
        id: id || idFromDatum,
        name: name || nameFromDatum,
      });
    },
  });
}

// TODO: also get mentions? Does that improve the bot score?
/** once we receive the timeline,
 * save to file, and
 * send it to Botometer */
function onReceiveTimeline(err, data, response, { id, name }) {
  console.log("status: ", response.statusCode);
  if (err) throw err;

  console.log(
    `🌟: writing ${
      data.length
    } tweets to timeline.json for user ${JSON.stringify({
      id,
      name,
    })}`
  );

  // save to file
  writeTimelineToFile(data);

  // Botometer
  // * requires both user id and name
  // TODO
  // requestBotometerScore({ id, name }, data);
}

function requestBotometerScore({ id, name }, data) {
  const req = unirest(
    "POST",
    "https://botometer-pro.p.rapidapi.com/2/check_account"
  );

  req.headers({
    "x-rapidapi-host": "botometer-pro.p.rapidapi.com",
    "x-rapidapi-key": rapidapi_key,
    "content-type": "application/json",
    accept: "application/json",
    useQueryString: true,
  });

  req.type("json");
  req.send({
    user: { id, screen_name: name },
    timeline: data,
    mentions: [],
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
  });
}

const FILE_PATH = "./timeline.json";

function writeTimelineToFile(response) {
  fs.unlink(FILE_PATH, (err) => {
    if (err) console.log(err);
    fs.open(FILE_PATH, "w", (err, fileDirNum) =>
      onOpened(err, fileDirNum, response)
    );
  });
}
function onOpened(err, fileDirNum, response) {
  fs.write(fileDirNum, JSON.stringify(response), null, "utf8", () =>
    onWriteToFile(fileDirNum)
  );
}
function onWriteToFile(fileDirNum) {
  fs.close(fileDirNum, () => {
    console.log("Finished writing to timeline.json");
  });
}
