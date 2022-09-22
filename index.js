#!/usr/bin/env node
"use strict";
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
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
    default: "npm install --omit=dev --prefer-offline --no-audit --no-fund",
    description: "Command to install dependencies",
  })
  .option("cacheDir", {
    type: "string",
    default: `${process.env.HOME}/.cache`,
    description: "Command to install dependencies",
  })
  .help()
  .parseSync();

const cwd = process.cwd();

const { installPkgs } = require("./main");
installPkgs({
  cwd,
  source: argv.source,
  dist: argv.dist,
  command: argv.command,
  cacheDir: argv.cacheDir,
});
