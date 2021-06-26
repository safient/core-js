# Safient Core SDK

JavaScript SDK to manage and interact with the safes on Safient protocol.

## Installation

```bash
  git clone https://github.com/safient/safient-core.git
  cd safient-core
  npm install
```

## Running Tests

Create an `.env` file in the `middleware` and `root` folder with `USER_API_KEY`, `USER_API_SECRET` and `DB_FILE_NAME='./thread.config'`
##### Terminal 1

* Need ts compiled dist folder to run tests
```bash
  npx tsc -w
```

##### Terminal 2

```bash
  cd middleware
  npm run start
```
* Go to http://localhost:3001/initializeDb

##### Terminal 3

```bash
  cd ..
  npm run test
```
