/**
 * get cache dir from source hash
 * @param {string} cacheDir
 * @param {string} source
 * @returns
 */
function getCacheDir(cacheDir, source) {
  const contentHash = crypto.createHash("md5").update(source).digest("hex");
  const realCacheDir = path.resolve(cacheDir, `unmonorepo-pkg/${contentHash}`);
  return realCacheDir;
}

module.exports = {
  getCacheDir,
};
