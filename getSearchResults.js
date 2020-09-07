module.exports = getSearchResults;
const { T, getMediaArr } = require("./utils");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
async function getSearchResults({ term, numTweets, lang, mediaType }) {
  console.log("fetching search results 🐦");
  const result = await T.get(`search/tweets`, {
    q: term,
    count: numTweets,
    ...(lang ? { lang } : {}),
  });

  const statusesWithMedia = result.data.statuses.filter(
    (node) => getMediaArr(node).length > 0
  );
  console.log("🌟🚨: getSearchResults -> statuses", statusesWithMedia);

  const resultsWithMedia = {
    ...result,
    data: { ...result.data, statuses: statusesWithMedia },
  };

  if (!mediaType) {
    return result;
  } else {
    while (statusesWithMedia.length < numTweets) {
      await sleep(1000);
      const nextResult = await T.get(`search/tweets`, {
        q: term,
        count: numTweets,
        ...(lang ? { lang } : {}),
      });

      resultsWithMedia.data.statuses = [
        ...resultsWithMedia.data.statuses,
        ...nextResult.data.statuses.filter((node) =>
          filterByMediaType(node, mediaType, null)
        ),
      ];
    }
    return {
      ...resultsWithMedia,
      data: {
        ...resultsWithMedia.data,
        statuses: resultsWithMedia.data.statuses.slice(0, numTweets),
      },
    };
  }
}
