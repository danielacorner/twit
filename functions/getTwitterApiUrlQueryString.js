function getTwitterApiUrlQueryStringForStream() {
  const tweetFields = [
    "attachments",
    "author_id",
    "context_annotations",
    "conversation_id",
    "created_at",
    "entities",
    "geo",
    "id",
    "in_reply_to_user_id",
    "lang",
    "public_metrics",
    "possibly_sensitive",
    "referenced_tweets",
    "reply_settings",
    "source",
    "text",
    "withheld",
  ];
  const userFields = [
    "created_at",
    "description",
    "entities",
    "id",
    "location",
    "name",
    "pinned_tweet_id",
    "profile_image_url",
    "protected",
    "public_metrics",
    "url",
    "username",
    "verified",
    "withheld",
  ];
  const mediaFields = [
    "duration_ms",
    "height",
    "media_key",
    "preview_image_url",
    "type",
    "url",
    "width",
    "public_metrics",
    "alt_text",
  ];
  const placeFields = [
    "contained_within",
    "country",
    "country_code",
    "full_name",
    "geo",
    "id",
    "name",
    "place_type",
  ];
  // poll.fields
  const tweetExpansions = [
    "author_id",
    "referenced_tweets.id",
    // "attachments.poll_ids",
    // "attachments.media_keys",
    // "entities.mentions.username",
    // "geo.place_id", "in_reply_to_user_id",
    "referenced_tweets.id.author_id",
  ];

  const queryParams = [
    { key: "tweet.fields", val: tweetFields.join(",") },
    { key: "expansions", val: tweetExpansions.join(",") },
    { key: "user.fields", val: userFields.join(",") },
    { key: "media.fields", val: mediaFields.join(",") },
    { key: "place.fields", val: placeFields.join(",") },
  ];
  const queryString = `?${queryParams
    .map(({ key, val }) => `${key}=${val}`)
    .join("&")}`;
  return queryString;
}

function getTwitterApiUrlQueryStringForTimeline() {
  const tweetFields = [
    "attachments",
    "author_id",
    "context_annotations",
    "conversation_id",
    "created_at",
    "entities",
    "geo",
    "id",
    "in_reply_to_user_id",
    "lang",
    "public_metrics",
    "possibly_sensitive",
    "referenced_tweets",
    "reply_settings",
    "source",
    "text",
    "withheld",
  ];
  const userFields = [
    "created_at",
    "description",
    "entities",
    "id",
    "location",
    "name",
    "pinned_tweet_id",
    "profile_image_url",
    "protected",
    "public_metrics",
    "url",
    "username",
    "verified",
    "withheld",
  ];
  const mediaFields = [
    "duration_ms",
    "height",
    "media_key",
    "preview_image_url",
    "type",
    "url",
    "width",
    "public_metrics",
    "alt_text",
  ];
  const placeFields = [
    "contained_within",
    "country",
    "country_code",
    "full_name",
    "geo",
    "id",
    "name",
    "place_type",
  ];
  // poll.fields
  const tweetExpansions = [
    "author_id",
    "referenced_tweets.id",
    // "attachments.poll_ids",
    // "attachments.media_keys",
    // "entities.mentions.username",
    // "geo.place_id", "in_reply_to_user_id",
    "referenced_tweets.id.author_id",
  ];

  const queryParams = [
    { key: "tweet.fields", val: tweetFields.join(",") },
    { key: "expansions", val: tweetExpansions.join(",") },
    { key: "user.fields", val: userFields.join(",") },
    { key: "media.fields", val: mediaFields.join(",") },
    { key: "place.fields", val: placeFields.join(",") },
  ];
  const queryString = `?${queryParams
    .map(({ key, val }) => `${key}=${val}`)
    .join("&")}`;
  return queryString;
}
exports.getTwitterApiUrlQueryStringForStream =
  getTwitterApiUrlQueryStringForStream;
exports.getTwitterApiUrlQueryStringForTimeline =
  getTwitterApiUrlQueryStringForTimeline;
