// @ts-check
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

const { exec, execSync } = require("child_process");
const { getPackages, getPackagesSync } = require("@manypkg/get-packages");

/**
 * Recursively get all dependencies from a package.json except monorepo packages
 * @param {PackageJsonType} sourcePackageJson
 * @param {Array<PackageType>} packages
 * @returns {Partial<PackageJsonType>}
 */
function getDeps(sourcePackageJson, packages) {
  const monorepoPackageNames = packages.map((p) => p.packageJson.name);

  /**
   * @type {Record<string, string>}
   */
  const dependencies = {};
  const _processed = new Set();
  let jobs = [sourcePackageJson.dependencies];

  while (jobs.length) {
    const job = jobs.shift();
    if (!job) {
      continue;
    }

    for (const pkgName of Object.keys(job)) {
      if (_processed.has(pkgName)) {
        continue;
      }
      _processed.add(pkgName);

      const isMonorepoPkg = monorepoPackageNames.includes(pkgName);
      if (isMonorepoPkg) {
        const targetPkg = packages.find((p) => p.packageJson.name === pkgName);
        if (!targetPkg) {
          throw new Error(`can not find package ${pkgName}`);
        }
        const deps = targetPkg.packageJson.dependencies;
        if (deps) {
          jobs.push(deps);
        }
      } else {
        dependencies[pkgName] = job[pkgName];
      }
    }
  }

  // NOTE: just use dependencies filed to install
  return {
    name: `${sourcePackageJson.name}-unmonorepo-output`,
    private: true,
    dependencies,
  };
}

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
  };
}

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {InstallParamsType} params
 */
async function installPkg(params = {}) {
  const { cwd, source, dist, command, cacheDir, omitJson } =
    preProcessParams(params);

  // get package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  const { packages } = await getPackages(cwd);
  const finalPackageJson = getDeps(sourcePackageJson, packages);
  // get cache path
  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(finalPackageJson))
    .digest("hex");
  const realCacheDir = path.resolve(cacheDir, `unmonorepo-pkg/${contentHash}`);
  const finalPackageJsonStr = JSON.stringify(finalPackageJson, null, 2);

  if (!omitJson) {
    await fs.writeFile(path.resolve(dist, "package.json"), finalPackageJsonStr);
  }

  // output new package.json
  await fs.ensureDir(realCacheDir);
  await fs.writeFile(`${realCacheDir}/package.json`, finalPackageJsonStr);
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
    path.resolve(cwd, dist, "node_modules")
  );
}

/**
 * Install dependencies for a package.json
 *
 * will ignore monorepo packages by default
 * @param {InstallParamsType} params
 */
function installPkgSync(params = {}) {
  const { cwd, source, dist, command, cacheDir, omitJson } =
    preProcessParams(params);

  // get package.json
  const sourcePackageJson = require(path.resolve(cwd, source));
  const { packages } = getPackagesSync(cwd);
  const finalPackageJson = getDeps(sourcePackageJson, packages);
  // get cache path
  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(finalPackageJson))
    .digest("hex");
  const realCacheDir = path.resolve(cacheDir, `unmonorepo-pkg/${contentHash}`);
  const finalPackageJsonStr = JSON.stringify(finalPackageJson, null, 2);

  if (!omitJson) {
    fs.writeFileSync(path.resolve(dist, "package.json"), finalPackageJsonStr);
  }

  // output new package.json
  fs.ensureDirSync(realCacheDir);
  fs.writeFileSync(`${realCacheDir}/package.json`, finalPackageJsonStr);

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
    path.resolve(cwd, dist, "node_modules")
  );
}

module.exports = {
  installPkg,
  installPkgSync,
};
