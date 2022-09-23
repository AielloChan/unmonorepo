type PkgType = import("@manypkg/get-packages").Package;
type PkgJsonType = PkgType["packageJson"];

type PartialPkgJsonType = Partial<PkgJsonType>;

interface InstallPkgReturnType {
  pkgJson: PartialPkgJsonType;
}

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
  /**
   * can modify package.json before install
   */
  generateJson?: (pkgJson: PartialPkgJsonType) => any;
  /**
   * trigger after emit package.json, before npm install
   *
   * just in async mode
   */
  onBeforeInstall?: (params: InstallPkgReturnType) => any;
}

declare module "@unmonorepo/pkg" {
  export function installPkg(params?: InstallParamsType): Promise<InstallPkgReturnType>;
  export function installPkgSync(params?: InstallParamsType): InstallPkgReturnType;
}
