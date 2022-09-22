interface InstallParamsType {
  /**
   * working directory, defaults to process.cwd()
   */
  cwd?: string;
  /**
   * path to package.json, defaults to ./package.json
   */
  source?: string;
  /**
   * path to node_modules, defaults to ./dist
   */
  dist?: string;
  /**
   * install command, defaults to "npm install --omit=dev --prefer-offline --no-audit --no-fund"
   */
  command?: string;
  /**
   * install command, defaults to `${process.env.HOME}/.cache`
   */
  cacheDir?: string;
  /**
   * avoid output package.json file
   */
  omitJson?: boolean;
}

type PackageType = import("@manypkg/get-packages").Package;
type PackageJsonType = PackageType["packageJson"];

declare module "@unmonorepo/pkg" {
  export function installPkg(params?: InstallParamsType): Promise<void>;
  export function installPkgSync(params?: InstallParamsType): void;
}
