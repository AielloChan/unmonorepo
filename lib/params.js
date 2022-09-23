/**
 * Process params default value
 * @param {InstallParamsType} params
 * @returns
 */
function preProcessParams(params) {
  return {
    cwd: params.cwd || process.cwd(),
    source: params.source || "./package.json",
    dist: params.dist || "./dist",
    command:
      params.command ||
      "npm install --omit=dev --prefer-offline --no-audit --no-fund",
    cacheDir: params.cacheDir || `${process.env.HOME}/.cache`,
    omitJson: params.omitJson || false,
    generateJson: params.generateJson || undefined,
    onBeforeInstall: params.onBeforeInstall || undefined,
  };
}

module.exports = {
  preProcessParams,
};
