---
id: "cli-getting-started"
title: "Safient CLI"
sidebar_label: "Getting started"
custom_edit_url: null
---


CLI tool to run a Safien worker node and interact with the safes on Safient protocol..


## Getting started

```bash
  npm i @safient/cli
```

### Running the Safien worker on a testnet

```
  safient safien worker --network testnet
```
Enter the worker info when running for the first time


### Interacting with the Safient protocol

Create a new user:

```
  safient user create --name Safient1 --email safient1@safient.io --network testnet

```


Create a new safe:

```
  safient safe create --beneficiary did:key:z6MknvaZuK44SWdsK8m6t3mq7AWQ2Hj1zGhVTPywcPGS7qFf --data 'Test safe' --network testnet

```

Show a safe:

```
  safient safe show 01fgbz287dvds1ft1e4tdbjqkp --network testnet

```


## Building locally

```bash
  git clone https://github.com/safient/cli.git
  cd cli
  npm install
  npm run build
```

### Running Tests

Create an `.env` file in the `middleware` and `root` folder with `USER_API_KEY`, `USER_API_SECRET`


```bash
  cd ..
  npm run test
```
