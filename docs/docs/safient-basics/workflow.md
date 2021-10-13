---
sidebar_position: 2
keywords:
  - digital assets
  - self-sovereign
  - Crypto Inheritance
  - decentralized storage
  - trustless mechanism
description: Safient promises to securely and conveniently store any critical information that is needed to access and recover the assets in case of any tragic events. Safient also provides a trustless yet safe way to transfer and inherit the assets by close ones whenever such an unfortunate scenario occurs
image: https://twitter.com/safientio/photo
website: https://safient.io/
app: https://safient.io/
github: https://github.com/safient
twitter: https://twitter.com/safientio
npm: https://www.npmjs.com/package/safient-claims
---

# Workflow

This section elaborates the Safient workflow and list out the glossary.

## Who are involved in the protocol?

Safient mainly consists of these below actors for functioning of the protocol.

- 🧑‍🔧 **Safe creator**
- 🙍🙍 **Safe inheritor/ safe claimer (Beneficiary)**
- 💂💂 **Safe guardians**
- 🧑‍⚖️ **Claim arbitrators (Auto appointed)**
- 🙍🙍 **Safe Executor (Often beneficiary)**

As shown in the below diagram, each one of them interacts with the safe at one or the other phase of Safient flow. Refer to the workflow section for the entire Safient flow.

![](/img/highlevel.png)

### Core actors of Safient protocol:

**Safe creator:**
Anyone who has an account on [Safient](https://app.safient.io) can create a safe by adding the beneficiary and safe data (seed phrases or any other secret note). The safe creator may decide to pay a safe maintenance fee during the safe creation or at any time later.

**Safe inheritor/ safe claimer (Beneficiary):**
Safe beneficiaries are the ones who can claim the created safes. The safe creator themselves can be the beneficiary (for safe backup) or it can be their loved ones (for safe inheritance). It is a requirement that safe beneficiaries should be part of Safient (should have registered).

**Safe guardians**
Safe guardians are responsible for guarding and recovering the safes. No single guardian or set of guardians can recover the safe data entirely. But they are majorly responsible to recover the safe data. They make sure that the beneficiary can claim the safe data only after the "_safe claim_" has been verified.
Safe guardians are trustless in nature. That means neither the safe creator nor the beneficiary needs to trust these guardians. These guardians are appointed at random based on their protocol credentials.
The guardians are will be eligible for incentivization (deducted from the safe maintenance fee) whenever they participate in the safe recovery process.

### Secondary/ optional actors:

**Claim arbitrators:**
Currently, claim arbitrators are not the direct participants of the Safient protocol but they help to verify the safe claims created. Safient will use [Kleros](https://kleros.io/integrations) for creating and resolving safe claims.

**Safe executor:**
Safient doesn't explicitly require an executor to claim the safe. Instead, beneficiaries themselves act as safe executors.

### Entire application flow:

The technical workflow of Safient may seem slighlty elongated, but we are making sure that this doesn't hamper the user experience any participant. Here is how the application flow and a life cycle of a **safe** on Safient will look like:

- **User registers on the [Safient](http://app.safient.io/) platform.**
- **User creates a Safe**

  - Adds beneficiary
  - Selects the type of claim (auto/ manual)

    Refer glossary section to know more about the type of claim

  - Selects the type of data to secure/ share (Seed phrases/ Generic secret note)
  - Adds the data
  - Publishes the safe

- **Beneficiary creates a safe claim request**

  - Creates a claim with evidences (In case of manual claim)
  - Arbitrators validates the safe (In case of manual claim)
  - Trustless guardians recover the safe data

    Refer core actors section to know more about the guardians

## Technical workflow

Safient protocol is an amalgamation of a few of the fascinating web3 technology tools and protocols such as [IPFS](https://ipfs.io/), [Filecoin](https://filecoin.io/), [Textile](https://textile.io/) tools, [Ceramic](http://ceramic.network) network, and Ethereum blockchain. The combination of off-chain and onchain infrastructure is what makes the Safient technical architecture quite elegant.

![Tech workflow](/img/highlevel-tech.svg)

_Each web3 technology tool or protocol used in Safient has a unique role to play._

**Textile ThreadDb**: Stores public information of each user and and metadata of each safe created.

**IPFS**: Safient makes use of Textile buckets to store the safes of each user and thus leverages the IPFS technology to decentralize the safe storage. Although the safes are publicly accessible, they are protected with encryption algorithms and cryptography mechanisms such as [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing).

**Ceramic Network/ IDX**: Safient leverages Ceramic network as an identity layer by storing user information. and links the safe information to make it immutable. Safient will generate an unique identity (DID) and mainatain them on the Ceramic network to easily interact with each user on the network.

**Filecoin**: Safient ensures the safe durability by making sure that the IPFS data is always available with the help of Filecoin network. We use Textile [powergate](https://docs.textile.io/powergate/) to access the filecoin network and create deals.

**Ethereum contracts**: Safient has an incentivization and claim layer that ensures that the protocol is self reliant by incentivizing all the actors such as guardians. Currently, [Kleros](https://kleros.io/integrations) dispute resolution is used to manage the claims created by the safe beneficiaries.

The following section depicts the step by step technical workflow for **safe creation** and **safe claim**.

### Safe creation:

1. User creates a safe by encrypting the safe data with a randomly generated symmetric key (Safe secret). The encrypted safe data is then broadcasted to the IPFS network and then replicated with the help of Filecoin network.
2. Once the user selects the beneficiary, the safe secret is encrypted for the beneficiary but it is never stored anywhere. The encrypted safe secret is then split into shards with the help of _Shamir's secret sharing_ mechanism. Each of these shards are then allocated to a randomly selected trusltess guarding by encrypting it to them. All these encrypted shards are distributed to the guardians and also stored on the decentralized database (ThreadDb).
3. When the safe creation is initiated, the user may also pay the safe maintanance fee to the Safient incentivization contract on the Ethereim network. The fee can also be paid anytime before the safe is claimed.

![Safe Creation](/img/safe-creation.svg)

### Safe claim:

1. The beneficiary for whom the safe is assigned may claim the safe at anytime. Once the safe claim is initiated, a claim is created on the Kleros arbitration platform with type of claim, description and evidence.
2. When the claim is accepted by the arbitrators on the Kleros platform, it will allow the guardians to recover the safe.
3. A minimum set of guardians required for the safe recovery will decrypt their shard and submit to the safe.
4. The safe beneficiary will claim and decrypt the the safe once the guardians have recovered the required number of shards.

![Safe Claim](/img/safe-claim.svg)
