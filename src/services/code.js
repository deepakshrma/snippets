let browserCache;
(async function () {
  if ("caches" in window) {
    browserCache = await caches.open("code-snippets");
  }
})();
export const fetchSnipets = async (url, { types = [] } = {}) => {
  if (browserCache) {
    const response = await browserCache.match(url);
    if (response) return response;
    await browserCache.add(url);
    return await browserCache.match(url);
  } else {
    return fetch(url);
  }
};
