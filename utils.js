module.exports = {
  getMediaArr,
};

function getMediaArr(node) {
  return (
    (node.extended_entities &&
      node.extended_entities.media.map((media) => ({
        ...media,
        src:
          media.type === "video"
            ? media.video_info &&
              media.video_info.variants.find(
                ({ content_type }) => content_type === "video/mp4"
              ).url
            : media.media_url_https,
        poster: media.media_url_https,
      }))) ||
    []
  );
}
