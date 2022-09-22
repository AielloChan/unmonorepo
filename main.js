// @ts-check
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

const { exec, execSync } = require("child_process");
const { getPackages, getPackagesSync } = require("@manypkg/get-packages");

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {Object} [params]
 * @param {string} [params.cwd] working directory, defaults to process.cwd()
 * @param {string} [params.source] path to package.json, defaults to ./package.json
 * @param {string} [params.dist] path to node_modules, defaults to ./dist/node_modules
 * @param {string} [params.command] install command, defaults to "npm install --omit=dev --prefer-offline --no-audit --no-fund"
 * @param {string} [params.cacheDir] install command, defaults to `${process.env.HOME}/.cache`
 */
async function installPkg(params = {}) {
  const cwd = params.cwd || process.cwd();
  const source = params.source || "./package.json";
  const dist = params.dist || "./dist/node_modules";
  const command =
    params.command ||
    "npm install --omit=dev --prefer-offline --no-audit --no-fund";
  const cacheDir = params.cacheDir || `${process.env.HOME}/.cache`;

  // get package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  // get cache path
  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(sourcePackageJson))
    .digest("hex");
  const realCacheDir = path.resolve(cacheDir, `unmonorepo-pkg/${contentHash}`);

  const { packages } = await getPackages(cwd);
  const monorepoPackageNames = packages.map((p) => p.packageJson.name);

  // exclude monorepo packages
  const dependencies = sourcePackageJson.dependencies
    ? Object.keys(sourcePackageJson.dependencies)
        .filter((name) => !monorepoPackageNames.includes(name))
        .reduce((acc, name) => {
          acc[name] = sourcePackageJson.dependencies[name];
          return acc;
        }, {})
    : {};

  // NOTE: just use dependencies filed to install
  const finalPackageJson = {
    dependencies,
  };

  // output new package.json
  await fs.ensureDir(realCacheDir);
  await fs.writeFile(
    `${realCacheDir}/package.json`,
    JSON.stringify(finalPackageJson, null, 2)
  );
  // install
  await new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: realCacheDir,
        env: process.env,
        encoding: "utf-8",
      },
      (error, stdout, stderr) => {
        stdout && process.stdout.write(stdout);
        stderr && process.stderr.write(stderr);

        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      }
    );
  });
  // copy node modules
  await fs.copy(`${realCacheDir}/node_modules`, path.resolve(cwd, dist));
}

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {Object} [params]
 * @param {string} [params.cwd] working directory, defaults to process.cwd()
 * @param {string} [params.source] path to package.json, defaults to ./package.json
 * @param {string} [params.dist] path to node_modules, defaults to ./dist/node_modules
 * @param {string} [params.command] install command, defaults to "npm install --omit=dev --prefer-offline --no-audit --no-fund"
 * @param {string} [params.cacheDir] install command, defaults to `${process.env.HOME}/.cache`
 */
function installPkgSync(params = {}) {
  const cwd = params.cwd || process.cwd();
  const source = params.source || "./package.json";
  const dist = params.dist || "./dist/node_modules";
  const command =
    params.command ||
    "npm install --omit=dev --prefer-offline --no-audit --no-fund";
  const cacheDir = params.cacheDir || `${process.env.HOME}/.cache`;

  // get package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  // get cache path
  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(sourcePackageJson))
    .digest("hex");
  const realCacheDir = path.resolve(cacheDir, `unmonorepo-pkg/${contentHash}`);

  const { packages } = getPackagesSync(cwd);
  const monorepoPackageNames = packages.map((p) => p.packageJson.name);

  // exclude monorepo packages
  const dependencies = sourcePackageJson.dependencies
    ? Object.keys(sourcePackageJson.dependencies)
        .filter((name) => !monorepoPackageNames.includes(name))
        .reduce((acc, name) => {
          acc[name] = sourcePackageJson.dependencies[name];
          return acc;
        }, {})
    : {};

  // NOTE: just use dependencies filed to install
  const finalPackageJson = {
    dependencies,
  };

  // output new package.json
  fs.ensureDirSync(realCacheDir);
  fs.writeFileSync(
    `${realCacheDir}/package.json`,
    JSON.stringify(finalPackageJson, null, 2)
  );
  // install
  execSync(command, {
    cwd: realCacheDir,
    env: process.env,
    encoding: "utf-8",
    stdio: "inherit",
  });
  // copy node modules
  fs.copySync(`${realCacheDir}/node_modules`, path.resolve(cwd, dist));
}

module.exports = {
  installPkg,
  installPkgSync,
};
