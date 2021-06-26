# Safient Core SDK
JavaScript SDK to manage and interact with the safes on Safient protocol.


![logo](./logo.png)

Trustless crypto asset safe and inheritance protocol



## About Safient
Digital crypto assets are the talk of the town and gaining traction rapidly among all kinds of individuals and organizations. Due to the higher traction, these assets are highly valuable. So, one has to make sure that their assets are safe and sound.

Owning and securing the digital crypto-asset unlike other digital assets can be challenging due to the self-sovereign nature of the ownership. It means that the owner is the only safe keeper of the assets. For many users, this might be an intimidating role as they don't want to completely responsible for preserving the assets against attacks and natural disasters. Every user always desires a trusted recovery method in case of tragedies. But there is no standardized way to easily and securely back up and recover the assets. 

Safex promises to securely and conveniently store any critical information that is needed to access and recover the assets in case of any tragic events. Safex also provides a trustless yet safe way to transfer and inherit the assets by close ones whenever such an unfortunate scenario occurs.

Safex uses decentralized storage, smart contracts, and cryptography techniques to build a protocol that helps to store, recover, inherit crypto assets and other confidential information. In essence, you can think of Safex as your trusted guardian even though it is completely trustless.


## Technologies used:
* [Ceramic IDX](https://idx.xyz/)
* [Textile ThreadDb](https://docs.textile.io/threads/)



## Getting Started

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
  cd ..
  npm run test
```

## Contributing

You are welcome to submit issues and enhancement requests and work on any of the existing issues. Follow this simple guide to contribute to the repository.

 1. **Create** or pick an existing issue to work on
 2. **Fork** the repo on GitHub
 3. **Clone** the forked project to your own machine
 4. **Commit** changes to your own branch
 5. **Push** your work back up to your forked repo
 6. Submit a **Pull request** from the forked repo to our repo so that we can review your changes


 ## Resources:

* [Website](https://safient.co)
* [Web App](https://app.safient.co)
* [Twitter](https://twitter.con/safientio)
* [Discord](https://discord.safient.io)