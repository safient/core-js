---
sidebar_position: 1
keywords:
  - digital assets
  - self-sovereign
  - Crypto Inheritance
  - trustless mechanism
description: Safient promises to securely and conveniently store any critical information that is needed to access and recover the assets in case of any tragic events. Safient also provides a trustless yet safe way to transfer and inherit the assets by close ones whenever such an unfortunate scenario occurs
image: https://twitter.com/safientio/photo
website: https://safient.io/
app: https://safient.io/
github: https://github.com/safient
twitter: https://twitter.com/safientio
npm: https://www.npmjs.com/package/safient-claims
---

# Basics


---
## What is Asguard?

Asaguard is a plug and play solution for DApps and wallet providers to quickly create a smart contract wallet leveraging account abstraction to provide whole bunch of features that provides security and best user experience.

Asguard provides the easiest way to create a wallet with easy onboarding and yet provides the best recovery solution to ensure that the user always retains control of the wallet.

Unlike existing non-custodial wallets, the user doesn’t need to back up their wallet seed phrases while creating the account. In case of loss of access to the wallet, it can be self-recovered or claimed by beneficiaries at the right time without any intermediaries. 

The wallet users can add a recovery mechanism and beneficiary at any time. This enables the wallet to be self-recovered anytime by the creator and claimed by the beneficiary only during certain events.

---

## Features:


- **No seed phrases**
    - Thanks to smart contract wallets leveraging account abstraction using ERC 4337
- **No onboarding cost**
    - Users can pay for anything in ERC20 tokens, including gas or sponsored by the app developer
- **Secure and convenient recovery**
    - Thanks to smart contract wallets that enable secure and convenient recovery of wallets
- **Granular permissions - future**

### Wallet recovery solutions

**Self-recovery types:**

- **Social recovery** with the help of other devices, family and friends, or custodial signers
- **2FA-based recovery** with the help of email, WhatsApp, and mobile devices

**Beneficiary recovery types:**

- **Deadman switch (pedal)** recovery allows beneficiaries to access the wallet after a specified inactivity period.
- **Date/session-based** recovery allows the beneficiary to access the wallet at a specified date and time for a specified time duration.
- **Arbitration-**based recovery allows the beneficiary to access the wallet after a specified onchain or off-chain event has been proven such as the demise of the wallet owner.

---

# Workflow

Higlevel architcture of all the components invloved in Asguard wallet infra.

![](/img/architecture.png)