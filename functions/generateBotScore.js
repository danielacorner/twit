const getTimeline = require("./getTimeline");
const axios = require("axios").default;

async function generateBotScore(tweetsByUser, res) {
  return new Promise(async (resolve, reject) => {
    const user = tweetsByUser[0].user;
    console.log("🌟🚨 ~ returnnewPromise ~ user", {
      id_str: user.id_str,
      screen_name: user.screen_name,
    });

    // TODO: fetch ~50? tweets for user, then pass them into timeline here
    const timeline = await getTimeline({
      userId: user.id_str,
      numTweets: 50,
      screenName: user.screen_name,
    });
    console.log("🌟🚨 ~ returnnewPromise ~ timeline", timeline.length);

    const options = {
      method: "POST",
      url: "https://botometer-pro.p.rapidapi.com/4/check_account",
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": "botometer-pro.p.rapidapi.com",
        "x-rapidapi-key": process.env.BOTOMETER_RAPIDAPI_KEY,
      },
      data: { mentions: [], timeline, user },
    };

    // https://botometer.osome.iu.edu/faq
    // https://rapidapi.com/OSoMe/api/botometer-pro/details
    // check usage at https://rapidapi.com/developer/dashboard

    axios
      .request(options)
      .then(function (response) {
        console.log("🌟🚨 ~ response", response.statusText, response.status);
        const {
          cap, // Complete Automation Probability (CAP) is the conditional probability that accounts with a score equal to or greater than this are automated; based on inferred language
          // While bot scores are useful for visualization and behavior analysis, they don't provide enough information by themselves to make a judgement about an account. A more meaningful way to interpret a score is to ask: "What are the chances that an account with a bot score higher than this account is human, or automated?" To answer this question, the Botometer API provides the so-called CAP, defined as the probability, according to our models, that an account with this score or greater is controlled by software, i.e., is a bot. (For the statisticians, this conditional probability calculation uses Bayes' theorem to take into account an estimate of the overall prevalence of bots, so as to balance false positives with false negatives.)

          display_scores,
          raw_scores,
        } = response.data;
        console.log("🌟🚨 ~ raw_scores", raw_scores);
        const { english, universal } = raw_scores;

        // * currently we'll only use english

        // Bot scores are displayed on a 0-to-5 scale with zero being most human-like and five being the most bot-like. A score in the middle of the scale is a signal that our classifier is uncertain about the classification.

        //       Bot types:

        // fake_follower: bots purchased to increase follower counts
        // self_declared: bots from botwiki.org
        // astroturf: manually labeled political bots and accounts involved in follow trains that systematically delete content
        // spammer: accounts labeled as spambots from several datasets
        // financial: bots that post using cashtags
        // other: miscellaneous other bots obtained from manual annotation, user feedback, etc.

        const {
          astroturf,
          fake_follower,
          financial,
          other,
          overall,
          self_declared,
          spammer,
        } = universal; // universal = language-independent

        resolve({
          astroturf,
          fake_follower,
          financial,
          other,
          overall,
          self_declared,
          spammer,
        });
      })
      .catch(function (error) {
        console.log("🌟🚨 ~ returnnewPromise ~ error", error);
      });
  });
}

module.exports = generateBotScore;
