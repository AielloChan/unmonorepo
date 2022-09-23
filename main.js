// @ts-check
const path = require("path");
const fs = require("fs-extra");
const { getPkgJson } = require("./lib/dependences");
const { preProcessParams } = require("./lib/params");
const { installModules, installModulesSync } = require("./lib/modules");
const { getPackages, getPackagesSync } = require("@manypkg/get-packages");

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {InstallParamsType} params
 */
async function installPkg(params = {}) {
  const {
    cwd,
    source,
    dist,
    command,
    cacheDir,
    omitJson,
    generateJson,
    onBeforeInstall,
  } = preProcessParams(params);

  // generate package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  const { packages } = await getPackages(cwd);
  let pkgJson = getPkgJson(sourcePackageJson, packages);
  if (generateJson) {
    pkgJson = await generateJson(JSON.parse(JSON.stringify(pkgJson)));
  }
  const pkgJsonStr = JSON.stringify(pkgJson, null, 2);

  // output new package.json to dist
  if (!omitJson) {
    await fs.ensureDir(dist);
    await fs.writeFile(path.resolve(dist, "package.json"), pkgJsonStr);
  }

  // get cache path
  onBeforeInstall && (await onBeforeInstall({ pkgJson }));

  await installModules({ pkgJsonStr, cacheDir, dist, command });

  return {
    pkgJson,
  };
}

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {InstallParamsType} params
 */
function installPkgSync(params = {}) {
  const {
    cwd,
    source,
    dist,
    command,
    cacheDir,
    omitJson,
    generateJson,
    onBeforeInstall,
  } = preProcessParams(params);
  // generate package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  const { packages } = getPackagesSync(cwd);
  let pkgJson = getPkgJson(sourcePackageJson, packages);
  if (generateJson) {
    pkgJson = generateJson(JSON.parse(JSON.stringify(pkgJson)));
  }
  const pkgJsonStr = JSON.stringify(pkgJson, null, 2);

  // output new package.json to dist
  if (!omitJson) {
    fs.ensureDirSync(dist);
    fs.writeFileSync(path.resolve(dist, "package.json"), pkgJsonStr);
  }

  // get cache path
  onBeforeInstall && onBeforeInstall({ pkgJson });

  installModulesSync({ pkgJsonStr, cacheDir, dist, command });

  return {
    pkgJson,
  };
}

module.exports = {
  installPkg,
  installPkgSync,
};
