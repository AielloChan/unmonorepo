// @ts-check
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { execSync } = require("child_process");
const packageJson = require("./package.json");

// get some params
const argv = yargs(hideBin(process.argv))
  .version(packageJson.version)
  .option("source", {
    alias: "s",
    type: "string",
    default: "./package.json",
    description: "Which packages.json to use",
  })
  .option("dist", {
    alias: "d",
    type: "string",
    default: "./dist/node_modules",
    description: "Where to put the final node_modules",
  })
  .option("command", {
    alias: "c",
    type: "string",
    default: "npm install --omit=dev --prefer-offline",
    description: "Command to install dependencies",
  })
  .help()
  .parseSync();

const cwd = process.cwd();

// get package.json
const sourecePackageJson = require(path.resolve(cwd, argv.source));
// get cache path
const contentHash = crypto
  .createHash("md5")
  .update(JSON.stringify(sourecePackageJson))
  .digest("hex");
const cacheDir = `${process.env.HOME}/.cache/${packageJson.name}/${contentHash}`;

// NOTE: just use dependencies filed to install
const finalPackageJson = { dependencies: sourecePackageJson.dependencies };

// output new package.json
fs.ensureDirSync(cacheDir);
fs.writeFileSync(
  `${cacheDir}/package.json`,
  JSON.stringify(finalPackageJson, null, 2)
);
// install
execSync(argv.command, {
  cwd: cacheDir,
  env: process.env,
  encoding: "utf-8",
  stdio: "inherit",
});
// copy node modules
fs.copySync(`${cacheDir}/node_modules`, path.resolve(cwd, argv.dist));