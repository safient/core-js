const { Client, Where, ThreadID } = require('@textile/hub');
const shamirs = require('shamirs-secret-sharing');

import { getCredentials } from '../utils/threadDb';

export const checkEmailExists = async function (email) {
  try {
    const { threadDb, client } = await getCredentials();
    const threadId = ThreadID.fromBytes(threadDb);
    const query = new Where('email').eq(email);
    const result = await client.find(threadId, 'Users', query);
    if (result.length === 1) {
      return {
        status: false,
        user: result[0],
      };
    }
    return { status: true };
  } catch (e) {
    console.log('Error:', e);
    return { status: false };
  }
};

export const registerNewUser = async function (did, name, email, signUpMode) {
  try {
    console.log('mode:', signUpMode);
    //generate aes key for the user
    const { threadDb, client } = await getCredentials();
    const threadId = ThreadID.fromBytes(threadDb);
    const data = {
      did: did,
      name: name,
      email: email,
      safes: [],
      signUpMode: signUpMode,
    };

    const query = new Where('did').eq(did);
    const result = await client.find(threadId, 'Users', query);
    if (result.length < 1) {
      await client.create(threadId, 'Users', [data]);
      return data;
    }
    console.log('User already exists!!');
    return false;
  } catch (err) {
    console.log('err:', err);
    return false;
  }
};

export const getLoginUser = async function (did) {
  try {
    const { client, threadDb } = await getCredentials();
    const query = new Where('did').eq(did);
    const threadId = ThreadID.fromBytes(threadDb);
    const result = await client.find(threadId, 'Users', query);

    if (result.length < 1) {
      console.log('Please register user!');
      return null;
    }
    return result[0];
  } catch (err) {
    console.log('err:', err);
    return null;
  }
};

export const getAllUsers = async function (did) {
  try {
    const { threadDb, client } = await getCredentials();
    const threadId = ThreadID.fromBytes(threadDb);
    const registeredUsers = await client.find(threadId, 'Users', {});
    let caller;
    let userArray = [];
    console.log('Registered users:', registeredUsers);

    for (let i = 0; i < registeredUsers.length; i++) {
      const result = registeredUsers[i];
      const value = {
        name: result.name,
        email: result.email,
        did: result.did,
      };
      if (did.toLowerCase() === result.did.toLowerCase()) {
        caller = value;
      } else {
        userArray.push(value);
      }
    }

    return {
      userArray: userArray,
      caller: caller,
    };
  } catch (e) {
    console.log('err:', e);
    return null;
  }
};

export const sharePortfolio = async function (sender, receiver, documentId, encKey, requestId) {
  try {
    console.log('sender:', sender);
    console.log('receiver:', receiver);
    console.log('id:', requestId);
    const { threadDb, client } = await getCredentials();
    const threadId = ThreadID.fromBytes(threadDb);

    // update sender sharedWith array
    let query = new Where('did').eq(sender.did);
    let user = await client.find(threadId, 'RegisterUser', query);
    if (user[0].docID === '0') {
      user[0].docID = documentId;
    }
    if (user[0].sharedWith.length === 0) {
      user[0].sharedWith = [receiver.senderDid];
    } else {
      user[0].sharedWith.push(receiver.senderDid);
    }

    user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId);
    console.log('Removed!!');

    await client.save(threadId, 'RegisterUser', [user[0]]);

    // update receiver sharedData array
    query = new Where('did').eq(receiver.senderDid);
    user = await client.find(threadId, 'RegisterUser', query);
    if (user[0].sharedData.length === 0) {
      user[0].sharedData = [
        {
          encryptedKey: encKey,
          documentId: documentId,
          senderName: sender.name,
          senderEmail: sender.email,
          senderDid: sender.did,
        },
      ];
    } else {
      user[0].sharedData.push({
        encryptedKey: encKey,
        documentId: documentId,
        senderName: sender.name,
        senderEmail: sender.email,
        senderDid: sender.did,
      });
    }
    await client.save(threadId, 'RegisterUser', [user[0]]);
    return true;
  } catch (e) {
    console.log('Err:', e);
    return false;
  }
};

export const rejectPortfolioRequest = async function (sender, requestId) {
  const { threadDb, client } = await getCredentials();
  const threadId = ThreadID.fromBytes(threadDb);

  try {
    // update sender sharedWith array
    let query = new Where('did').eq(sender.did);
    let user = await client.find(threadId, 'RegisterUser', query);
    user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId);
    console.log('Removed!!');
    await client.save(threadId, 'RegisterUser', [user[0]]);
    return true;
  } catch (e) {
    console.log('Error:', e);
    return false;
  }
};

export const updateName = async function (name, email) {
  const { threadDb, client } = await getCredentials();
  const threadId = ThreadID.fromBytes(threadDb);
  try {
    let query = new Where('email').eq(email);
    let user = await client.find(threadId, 'Users', query);
    user[0].name = name;
    await client.save(threadId, 'Users', [user[0]]);
    console.log('updated!!');
    return true;
  } catch (e) {
    console.log('Error:', e);
    return false;
  }
};

export const updateDocID = async function (email, docID) {
  const { threadDb, client } = await getCredentials();
  const threadId = ThreadID.fromBytes(threadDb);
  try {
    let query = new Where('email').eq(email);
    let user = await client.find(threadId, 'RegisterUser', query);
    user[0].docID = docID;
    await client.save(threadId, 'RegisterUser', [user[0]]);
    console.log('updated!!');
    return true;
  } catch (e) {
    console.log('Error:', e);
    return false;
  }
};

export const requestPortfolio = async function (sender, receiver) {
  const { threadDb, client } = await getCredentials();
  const threadId = ThreadID.fromBytes(threadDb);
  let query = new Where('did').eq(receiver.did);
  let user = await client.find(threadId, 'RegisterUser', query);
  if (user[0].requests.length === 0) {
    user[0].requests = [
      {
        senderDid: sender.did,
        name: sender.name,
        requestId: user[0].requests.length + 1,
      },
    ];
  } else {
    user[0].requests.push({
      senderDid: sender.did,
      name: sender.name,
      requestId: user[0].requests.length + 1,
    });
  }
  await client.save(threadId, 'RegisterUser', [user[0]]);

  query = new Where('did').eq(sender.did);
  user = await client.find(threadId, 'RegisterUser', query);
  if (user[0].requested.length === 0) {
    user[0].requested = [
      {
        receiverDid: receiver.did,
        name: receiver.name,
      },
    ];
  } else {
    user[0].requested.push({
      receiverDid: receiver.did,
      name: receiver.name,
    });
  }
  await client.save(threadId, 'RegisterUser', [user[0]]);
  return true;
};

export const randomGuardians = async (creatorDID, inheritorDID) => {
  const { threadDb, client } = await getCredentials();
  const threadId = ThreadID.fromBytes(threadDb);
  const users = await client.find(threadId, 'Users', {});
  let guardians = [];
  // console.log("Users", users)
  let guardianIndex = 0;
  while (guardianIndex <= 2) {
    const index = Math.floor(Math.random() * users.length);
    let randomGuardian = users[index];
    if (
      creatorDID !== randomGuardian.did &&
      inheritorDID !== randomGuardian.did &&
      !guardians.includes(randomGuardian.did)
    ) {
      guardians.push(randomGuardian.did);
      guardianIndex = guardianIndex + 1;
    } else {
      guardianIndex = guardians.length;
    }
  }
  console.log(guardians);
  return guardians;
};

export const createNewSafe = async function (creator, inheritor, encryptedKey, recipentEnc, encryptedData, idx) {
  try {
    //generate aes key for the user
    const { threadDb, client } = await getCredentials();
    const threadId = ThreadID.fromBytes(threadDb);

    const secretShares = shamirs.split(JSON.stringify(recipentEnc), { shares: 3, threshold: 2 });

    const guardians = await randomGuardians(creator, inheritor);

    const guardianOne = await getLoginUser(guardians[0]);
    const guardianTwo = await getLoginUser(guardians[1]);
    const guardianThree = await getLoginUser(guardians[2]);
    console.log(guardianOne.safes);

    const shardOne = await idx.ceramic.did.createDagJWE(secretShares[0], [guardians[0]]);
    const shardTwo = await idx.ceramic.did.createDagJWE(secretShares[1], [guardians[1]]);
    const shardThree = await idx.ceramic.did.createDagJWE(secretShares[2], [guardians[2]]);

    const shardData = [
      {
        status: 0,
        encShard: shardOne,
        decData: null,
      },
      {
        status: 0,
        encShard: shardTwo,
        decData: null,
      },
      {
        status: 0,
        encShard: shardThree,
        decData: null,
      },
    ];

    const data = {
      creator: creator,
      guardians: guardians,
      recipient: inheritor,
      encSafeKey: encryptedKey,
      encSafeData: encryptedData,
      stage: 0,
      encSafeKeyShards: shardData,
    };

    const safe = await client.create(threadId, 'Safes', [data]);
    console.log(safe);

    const creatorQuery = new Where('did').eq(creator);
    const inheritorQuery = new Where('did').eq(inheritor);
    let creatorUser = await client.find(threadId, 'Users', creatorQuery);
    let recipientUser = await client.find(threadId, 'Users', inheritorQuery);

    console.log(creatorUser);

    if (creatorUser[0].safes === 0) {
      creatorUser[0].safes = [
        {
          safeId: safe[0],
          type: 'creator',
        },
      ];
    } else {
      creatorUser[0].safes.push({
        safeId: safe[0],
        type: 'creator',
      });
    }

    if (recipientUser[0].safes === 0) {
      recipientUser[0].safes = [
        {
          safeId: safe[0],
          type: 'inheritor',
        },
      ];
    } else {
      recipientUser[0].safes.push({
        safeId: safe[0],
        type: 'inheritor',
      });
    }

    if (guardianOne.safes === 0) {
      guardianOne.safes = [
        {
          safeId: safe[0],
          type: 'guardian',
        },
      ];
    } else {
      guardianOne.safes.push({
        safeId: safe[0],
        type: 'guardian',
      });
    }

    if (guardianTwo.safes === 0) {
      guardianTwo.safes = [
        {
          safeId: safe[0],
          type: 'guardian',
        },
      ];
    } else {
      guardianTwo.safes.push({
        safeId: safe[0],
        type: 'guardian',
      });
    }

    if (guardianThree.safes === 0) {
      guardianThree.safes = [
        {
          safeId: safe[0],
          type: 'guardian',
        },
      ];
    } else {
      guardianThree.safes.push({
        safeId: safe[0],
        type: 'guardian',
      });
    }

    await client.save(threadId, 'Users', [creatorUser[0]]);
    await client.save(threadId, 'Users', [recipientUser[0]]);

    await client.save(threadId, 'Users', [guardianOne]);
    await client.save(threadId, 'Users', [guardianTwo]);
    await client.save(threadId, 'Users', [guardianThree]);

    return true;
  } catch (err) {
    console.log('err:', err);
    return false;
  }
};

export const getSafeData = async function (safeId) {
  try {
    const { client, threadDb } = await getCredentials();
    const query = new Where('_id').eq(safeId);
    const threadId = ThreadID.fromBytes(threadDb);
    const result = await client.find(threadId, 'Safes', query);

    if (result.length) {
      return result[0];
    }
  } catch (err) {
    console.log('err:', err);
    return null;
  }
};

export const claimSafe = async (safeId) => {
  const { client, threadDb } = await getCredentials();
  try {
    const query = new Where('_id').eq(safeId);
    const threadId = ThreadID.fromBytes(threadDb);
    const result = await client.find(threadId, 'Safes', query);

    if (result[0].stage === 0) {
      result[0].stage = 1;
    }
    await client.save(threadId, 'Safes', [result[0]]);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const decryptShards = async (idx, safeId, shard) => {
  const { client, threadDb } = await getCredentials();
  try {
    const query = new Where('_id').eq(safeId);
    const threadId = ThreadID.fromBytes(threadDb);
    const result = await client.find(threadId, 'Safes', query);

    if (result[0].stage === 1) {
      result[0].stage = 2;
    }

    const decShard = await idx.ceramic.did.decryptDagJWE(result[0].encSafeKeyShards[shard].encShard);
    result[0].encSafeKeyShards[shard].status = 1;
    result[0].encSafeKeyShards[shard].decData = decShard;

    await client.save(threadId, 'Safes', [result[0]]);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
