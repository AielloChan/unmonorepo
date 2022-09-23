// @ts-check
const path = require("path");
const fs = require("fs-extra");
const { getCacheDir } = require("./cache");
const { exec, execSync } = require("child_process");

/**
 * Install dependencies for a package.json
 * @param {Object} param
 * @param {string} param.pkgJsonStr
 * @param {string} param.cacheDir
 * @param {string} param.dist
 * @param {string} param.command
 */
async function installModules({ pkgJsonStr, cacheDir, dist, command }) {
  const realCacheDir = getCacheDir(cacheDir, pkgJsonStr);

  // output new package.json to cache dir
  await fs.ensureDir(realCacheDir);
  await fs.writeFile(`${realCacheDir}/package.json`, pkgJsonStr);

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
  await fs.copy(
    `${realCacheDir}/node_modules`,
    path.resolve(dist, "node_modules")
  );
}

/**
 * Install dependencies for a package.json
 * @param {Object} param
 * @param {string} param.pkgJsonStr
 * @param {string} param.cacheDir
 * @param {string} param.dist
 * @param {string} param.command
 */
function installModulesSync({ pkgJsonStr, cacheDir, dist, command }) {
  const realCacheDir = getCacheDir(cacheDir, pkgJsonStr);

  // output new package.json to cache dir
  fs.ensureDirSync(realCacheDir);
  fs.writeFileSync(`${realCacheDir}/package.json`, pkgJsonStr);

  // install
  execSync(command, {
    cwd: realCacheDir,
    env: process.env,
    encoding: "utf-8",
    stdio: "inherit",
  });
  // copy node modules
  fs.copySync(
    `${realCacheDir}/node_modules`,
    path.resolve(dist, "node_modules")
  );
}

module.exports = {
  installModules,
  installModulesSync,
};
