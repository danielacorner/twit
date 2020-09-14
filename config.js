require("dotenv").config();

module.exports = {
  config: {
    // api key
    consumer_key: process.env.TWITTER_API_KEY,
    // api key secret
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    // app_only_auth:true,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  // botometer key (not yet used)
  rapidapi_key: process.env.BOTOMETER_RAPIDAPI_KEY,
};
