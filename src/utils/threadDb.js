const { Client, Where, ThreadID } = require('@textile/hub');
const io = require('socket.io-client');

import { threadId } from './threadConfig.json';

export const solveChallenge = (identity) => {
  return new Promise((resolve, reject) => {
    const socket = io(process.env.NEXT_PUBLIC_MIDDLEWARE_URL);
    socket.on('connect', () => {
      const publicKey = identity.public.toString();

      // Send public key to server
      socket.emit(
        'authInit',
        JSON.stringify({
          pubKey: publicKey,
          type: 'token',
        })
      );

      socket.on('authMsg', async (event) => {
        const data = JSON.parse(event);
        switch (data.type) {
          case 'error': {
            reject(data.value);
            break;
          }

          //solve the challenge
          case 'challenge': {
            const buf = Buffer.from(data.value);
            const signed = await identity.sign(buf);
            socket.emit('challengeResp', signed);
            break;
          }

          //get the token and store it
          case 'token': {
            resolve(data.value);
            socket.disconnect();
            break;
          }
        }
      });
    });
  });
};

export const loginUserWithChallenge = async function (id) {
  if (!id) {
    throw Error('No user ID found');
  }

  /** Use the identity to request a new API token when needed */
  const credentials = await solveChallenge(id);
  localStorage.setItem('payload', JSON.stringify(credentials));
  const client = await Client.withUserAuth(credentials.payload);
  console.log('Verified on Textile API!!');
  return client;
};

export const getCredentials = async function () {
  const credentials = JSON.parse(localStorage.getItem('payload'));
  const threadDB = credentials.threadDbId;
  const client = Client.withUserAuth(credentials.payload);
  const threadDb = Uint8Array.from(threadDB);
  return { client, threadDb };
};


export const getThreadId = async () => {
  return threadId;
};
