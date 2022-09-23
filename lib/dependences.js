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
   * @type {Record<string, string>}
   */
  const allDependencies = {};
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
        allDependencies[pkgName] = job[pkgName];
      }
    }
  }

  // exclude some packages
  const dependencies = Object.keys(allDependencies).reduce((acc, key) => {
    if (!exclude.includes(key)) {
      acc[key] = allDependencies[key];
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
