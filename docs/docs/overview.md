---
id: "overview"
title: "Safient Contracts SDK"
slug: "/"
sidebar_label: "Overview"
sidebar_position: 0
custom_edit_url: null
---

# Safient Core SDK

JavaScript SDK for client to interact with Safient protocol.

## Local installation

```bash
  git clone git@github.com:safient/safient-core-js.git
  cd safient-core-js
  npm install
```

## Running Tests

Create a .env file in the root directory with `USER_API_KEY` and `USER_API_SECRET` for the threadDB or any database of choice.

#### Testing the contracts

```bash
  npm run test
```

## Getting started

```bash
  npm i @safient/core
```

## Usage

`SafientCore` takes 3 parameters:

- `signer` - Signer object from the wallet being used.
- `chainId` - Chain ID of the network being used.
- `databaseType` - Database to be used.

```javascript
// If not injected web3 provider, create a jsonRpcProvider
const { JsonRpcProvider } = require("@ethersproject/providers");
const provider = new JsonRpcProvider("http://localhost:8545");

// Get signer and chainId from provider
(async () => {
  const signer = await provider.getSigner();
  const providerNetwork = await provider.getNetwork();
  const chainId = providerNetwork.chainId;
})();
```

## Initialization

```javascript
import { SafientCore, Types } from "@safient/core";

const safient = new SafientCore(signer, chainId, "threadDB");
```
