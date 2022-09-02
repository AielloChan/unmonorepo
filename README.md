# Unmonorepo


## The problem

Monorepo is great, but when it comes to serverless, the node_modules directory needs to be as small as possible, and there should be no soft links.

It is difficult/impossible for the usual package managers to separately install condensed node_modules for a given package.json (--production)

## A simple version of solution

What **unmonorepo** does is relatively simple: install the specified package.json in the user cache directory, and then copy the resulting node_modules to the specified location.

## Usage

```bash
npm i -g unmonorepo
# or
yarn global add unmonorepo
```

Then just run

```bash
# all parameters are optional, see unmonorepo --help
unmonorepo --source=./package.json --dist=./dist/node_modules --command="npm install --omit=dev --prefer-offline"
```

Unmonorepo will grab **dependencies** in **./package.json** and run **npm install --omit=dev --prefer-offline** to install all dependencies, then copy node_modules to **./dist/node_modules**

