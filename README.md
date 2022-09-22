# @unmonorepo/pkg


## The problem

Monorepo is great, but when it comes to serverless, the node_modules directory needs to be as small as possible, and there should be no soft links.

It is difficult/impossible for the usual package managers to separately install condensed node_modules for a given package.json (--production)

## A simple version of solution

What **@unmonorepo/pkg** does is relatively simple: install the specified package.json in the user cache directory, and then copy the resulting node_modules to the specified location.

## Usage

```bash
npm i -g @unmonorepo/pkg
# or
yarn global add @unmonorepo/pkg
# or just exec
npx @unmonorepo/pkg
```

Then just run

```bash
# all parameters are optional, see unmonorepo/pkg --help
unmonorepo-pkg --source=./package.json --dist=./dist/node_modules --command="npm install --omit=dev --prefer-offline --no-audit --no-fund"
```

@unmonorepo/pkg will grab **dependencies** in **./package.json** and run **npm install --omit=dev --prefer-offline --no-audit --no-fund** to install all dependencies, then copy node_modules to **./dist/node_modules**

Or programmatically:

```js
const { installPkg, installPkgSync } from "@unmonorepo/pkg"

// just see its type def
installPkg({
  cwd,
  source: argv.source,
  dist: argv.dist,
  command: argv.command,
  cacheDir: argv.cacheDir,
})
```

## Note

Source package.json **dependencies** should not contain any workspace (monorepo modules), you should use webpack (or other javascript bundler) to pack your source code, or just use a script to process workspace dependency files.

