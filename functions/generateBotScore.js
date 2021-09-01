const getTimeline = require("./getTimeline");
const axios = require("axios").default;

const EMPTY_USER = {
  id: 0,
  id_str: "",
  name: "",
  username: "",
  screen_name: "",
  public_metrics: {
    followers_count: 0,
    following_count: 0,
    tweet_count: 0,
    listed_count: 0,
  },
  isNotABot: null,
  botScore: null,
  pinned_tweet_id: "",
  hiddenBotScore: null,
  location: null | "",
  url: null | "",
  description: null | "",
  translator_type: null,
  protected: null,
  verified: null,
  followers_count: 0,
  friends_count: 0,
  listed_count: 0,
  favourites_count: 0,
  statuses_count: 0,
  created_at: "",
  utc_offset: null,
  time_zone: null,
  geo_enabled: null,
  lang: null,
  contributors_enabled: null,
  is_translator: null,
  profile_background_color: "",
  profile_background_image_url: "",
  profile_background_image_url_https: "",
  profile_background_tile: null,
  profile_link_color: "#555",
  profile_sidebar_border_color: "#eaeaea",
  profile_sidebar_fill_color: "#eaeaea",
  profile_text_color: "#000",
  profile_use_background_image: null,
  profile_image_url: "",
  profile_image_url_https: "",
  profile_banner_url: "",
  default_profile: null,
  default_profile_image: null,
  following: null,
  follow_request_sent: null,
  notifications: null,
};

async function generateBotScore(tweetsByUser, res) {
  return new Promise(async (resolve, reject) => {
    const user = tweetsByUser[0].user;
    console.log("🌟🚨 ~ returnnewPromise ~ user", user);
    if (!user) {
      console.log("🚨 ~ NO USER", user);
      return;
    }
    // * fetch ~50? tweets for user, then pass them into timeline here
    const TWEETS_TO_FETCH = 200;
    const timeline = await getTimeline({
      userId: user.id_str,
      numTweets: TWEETS_TO_FETCH,
      screenName: user.screen_name,
    });

    const options = {
      method: "POST",
      url: "https://botometer-pro.p.rapidapi.com/4/check_account",
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": "botometer-pro.p.rapidapi.com",
        "x-rapidapi-key": process.env.BOTOMETER_RAPIDAPI_KEY,
      },
      data: {
        mentions: [],
        timeline,
        // api v2 user is missing some data like banner image url, botometer requires a full user objest
        user: { ...EMPTY_USER, user },
      },
    };

    // https://botometer.osome.iu.edu/faq
    // https://rapidapi.com/OSoMe/api/botometer-pro/details
    // check usage at https://rapidapi.com/developer/dashboard

    axios
      .request(options)
      .then(function (response) {
        console.log("🌟 ~ response", response.statusText, response.status);
        const {
          cap, // Complete Automation Probability (CAP) is the conditional probability that accounts with a score equal to or greater than this are automated; based on inferred language
          // While bot scores are useful for visualization and behavior analysis, they don't provide enough information by themselves to make a judgement about an account. A more meaningful way to interpret a score is to ask: "What are the chances that an account with a bot score higher than this account is human, or automated?" To answer this question, the Botometer API provides the so-called CAP, defined as the probability, according to our models, that an account with this score or greater is controlled by software, i.e., is a bot. (For the statisticians, this conditional probability calculation uses Bayes' theorem to take into account an estimate of the overall prevalence of bots, so as to balance false positives with false negatives.)

          display_scores,
          raw_scores,
        } = response.data;
        console.log("🌟 ~ raw_scores", raw_scores);
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
        console.log("🌟 ~ returnnewPromise ~ error", error);
      });
  });
}

module.exports = generateBotScore;
