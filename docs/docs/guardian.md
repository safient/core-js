---
sidebar_position: 5
---

# Run a guardian node

This section will enable you to test and run a guardian to become part of the Safient network 🤝

:::tip what is a Safient guardian (Safien)?

Safient guardians are responsible for guarding and recovering the safes. They are the backbone of the network to ensure that 
everything functions in a trustless and a non custodial way.

:::

### Get started

Running a Safient guardian node is easy as it gets. All you have to do is install Safient CLI package globally.


#### Install Safient CLI

```bash
  npm i @safient/cli -g
```

#### Running the Safien worker

Once the Safient CLI is installed all that needs to be done is use `safient` command to run a guardian worker as below.
If you are building an application using `Safient Core` and testing it locally, you should point the network to `devnet`.

```
  safient safien worker --network devnet
```
Enter the worker info when running for the first time.


:::info Running on Testnet
Currently Safient protocol is in alpha testnet stage and the nodes are hosted by us internally. But we are soon 
onboarding early external node runners to make our testnet network robust and incentivise these node runners for their 
early contribution. Provide your details [here](https://safient.io/get-started) if you want to be part of the Safient Network.
You can also reach out to us on our [Discord server](https://discord.safient.io/).

:::




- [Safient for developers](./dev-overview)



