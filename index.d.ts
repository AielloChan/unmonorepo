declare module "@unmonorepo/pkg" {
  interface IParams {
    cwd?: string;
    source?: string;
    dist?: string;
    command?: string;
    cacheDir?: string;
  }

  export function installPkg(params?: IParams): Promise<void>;
  export function installPkgSync(params?: IParams): void;
}
