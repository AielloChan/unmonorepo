declare module '@unmonorepo/pkg' {
  export function installPkg(params?: {
    cwd?: string;
    source?: string;
    dist?: string;
    command?: string;
    cacheDir?: string;
  }): void;
}