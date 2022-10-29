// @ts-check

/**
 * Recursively get all dependencies from a package.json except monorepo packages
 * @param {PkgJsonType} sourcePackageJson
 * @param {Array<PkgType>} packages
 * @param {Array<string>} exclude
 * @returns {Partial<PkgJsonType>}
 */
function getPkgJson(sourcePackageJson, packages, exclude = []) {
  const monorepoPackageNames = packages.map((p) => p.packageJson.name);

  /**
   * @type {Record<string, {
   *  source: string;
   *  version: string;
   * }>}
   */
  const allDependencies = {};
  const _processed = new Set();
  let jobs = [sourcePackageJson];

  while (jobs.length) {
    const job = jobs.shift();
    if (!job) {
      continue;
    }

    for (const pkgName of Object.keys(job.dependencies || {})) {
      if (_processed.has(pkgName)) {
        continue;
      }
      _processed.add(pkgName);

      const isMonorepoPkg = monorepoPackageNames.includes(pkgName);
      if (isMonorepoPkg) {
        // is a monorepo package
        // should recursively get dependencies
        const targetPkg = packages.find((p) => p.packageJson.name === pkgName);
        if (!targetPkg) {
          throw new Error(`can not find package ${pkgName}`);
        }
        const deps = targetPkg.packageJson.dependencies;
        if (deps) {
          jobs.push(targetPkg.packageJson);
        }
      } else {
        const pkgInfo = allDependencies[pkgName];
        const pkgVersion = job[pkgName];
        if (pkgInfo) {
          // this module is already exists
          // show alert if version is different
          if (pkgInfo.version !== pkgVersion) {
            console.warn(
              `package ${pkgName} version is conflict, ${pkgInfo.version} in ${pkgInfo.source} vs ${pkgVersion} in ${job.name}`
            );
          }
        } else {
          allDependencies[pkgName] = {
            source: job.name,
            version: pkgVersion,
          };
        }
      }
    }
  }

  // exclude some packages
  const dependencies = Object.keys(allDependencies).reduce((acc, key) => {
    if (!exclude.includes(key)) {
      acc[key] = allDependencies[key].version;
    }
    return acc;
  }, /** @type {Record<string, string>} */ ({}));

  // NOTE: just use dependencies filed to install
  return {
    name: `${sourcePackageJson.name}-unmonorepo-output`,
    private: true,
    dependencies,
  };
}

module.exports = {
  getPkgJson,
};
