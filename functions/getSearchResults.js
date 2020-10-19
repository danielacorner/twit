module.exports = getSearchResults;
const { T, getMediaArr, filterByMediaType } = require("../utils");
const uniqBy = require("lodash.uniqby");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
// https://developer.twitter.com/en/docs/twitter-api/v1/rules-and-filtering/overview/standard-operators
// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets
// rate limit: 180 per 15 min https://developer.twitter.com/en/docs/twitter-api/v1/rate-limits
async function getSearchResults({
  term,
  numTweets,
  lang,
  allowedMediaTypes,
  geocode,
  result_type,
}) {
  let max_id = null;

  console.log("fetching search results 🐦");
  const result = await T.get(`search/tweets`, {
    q: term,
    count: numTweets,
    ...(lang ? { lang } : {}),
    ...(geocode ? { geocode } : {}),
    result_type,
  });

  const allStatuses = result.data.statuses;

  const lastStatus = allStatuses[allStatuses.length - 1];

  max_id = lastStatus.id_str;

  const statusesWithMedia = result.data.statuses.filter(
    (node) => getMediaArr(node).length > 0
  );

  const resultsWithMedia = {
    ...result,
    data: { ...result.data, statuses: statusesWithMedia },
  };

  if (!allowedMediaTypes) {
    return result;
  } else {
    while (resultsWithMedia.data.statuses.length < numTweets) {
      await sleep(1000);
      const nextResult = await T.get(`search/tweets`, {
        q: term,
        count: numTweets,
        ...(max_id ? { max_id } : {}),
        ...(lang ? { lang } : {}),
      });

      const last_tweet = nextResult.data.statuses[numTweets - 1];

      max_id = last_tweet ? last_tweet.id_str : null;

      resultsWithMedia.data.statuses = [
        ...resultsWithMedia.data.statuses,
        ...nextResult.data.statuses.filter((node) =>
          filterByMediaType(node, allowedMediaTypes, null)
        ),
      ];
    }
    return {
      ...resultsWithMedia,
      data: {
        ...resultsWithMedia.data,
        statuses: uniqBy(resultsWithMedia.data.statuses, (t) => t.id_str).slice(
          0,
          numTweets
        ),
      },
    };
  }
}
