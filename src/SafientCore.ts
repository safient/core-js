import { IDX } from '@ceramicstudio/idx';
import { Client, PrivateKey, ThreadID, Where } from '@textile/hub';
import { getThreadId } from './utils/threadDb';
// @ts-ignore
import shamirs from 'shamirs-secret-sharing';
import { Connection, User, UserBasic, Users, SafeData, Shard } from './types/types';

require('dotenv').config();
export class SafientCore {
  private seed: Uint8Array;

  constructor(seed: Uint8Array) {
    this.seed = seed;
  }

  connectUser = async (): Promise<Connection> => {
    const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(this.seed));
    const client = await Client.withKeyInfo({
      key: `${process.env.USER_API_KEY}`,
      secret: `${process.env.USER_API_SECRET}`,
    });
    await client.getToken(identity);
    const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
    return {
      client,
      threadId,
    };
  };

  registerNewUser = async (
    conn: Connection,
    did: string,
    name: string,
    email: string,
    signUpMode: number
  ): Promise<string> => {
    try {
      const data = {
        did,
        name,
        email,
        safes: [],
        signUpMode,
      };

      const query = new Where('did').eq(did);
      const result: User[] = await conn.client.find(conn.threadId, 'Users', query);

      if (result.length < 1) {
        const newUser = await conn.client.create(conn.threadId, 'Users', [data]);
        return newUser[0];
      } else {
        throw new Error(`${email} already exists!`);
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  getLoginUser = async (conn: Connection, did: string): Promise<User> => {
    try {
      const query = new Where('did').eq(did);
      const result: User[] = await conn.client.find(conn.threadId, 'Users', query);

      if (result.length < 1) {
        throw new Error(`${did} is not registered!`);
      } else {
        return result[0];
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  getAllUsers = async (conn: Connection, did: string): Promise<Users> => {
    try {
      const registeredUsers: User[] = await conn.client.find(conn.threadId, 'Users', {});

      let caller: UserBasic | string = did;
      let userArray: UserBasic[] = [];

      for (let i = 0; i < registeredUsers.length; i++) {
        const result = registeredUsers[i];
        const value: UserBasic = {
          name: result.name,
          email: result.email,
          did: result.did,
        };

        did.toLowerCase() === result.did.toLowerCase() ? (caller = value) : (caller = `${did} is not registered!`);

        userArray.push(value);
      }

      return {
        userArray,
        caller,
      };
    } catch (err) {
      throw new Error(err);
    }
  };

  private randomGuardians = async (conn: Connection, creatorDID: string, inheritorDID: string): Promise<string[]> => {
    const users: User[] = await conn.client.find(conn.threadId, 'Users', {});

    let guardians: string[] = [];
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
    return guardians;
  };

  createNewSafe = async (
    conn: Connection,
    creator: string,
    inheritor: string,
    encryptedKey: Object,
    recipentEnc: Object,
    encryptedData: Object,
    idx: IDX
  ): Promise<string> => {
    try {
      const secretShares = shamirs.split(JSON.stringify(recipentEnc), { shares: 3, threshold: 2 });

      const guardians = await this.randomGuardians(conn, creator, inheritor);

      const guardianOne = await this.getLoginUser(conn, guardians[0]);
      const guardianTwo = await this.getLoginUser(conn, guardians[1]);
      const guardianThree = await this.getLoginUser(conn, guardians[2]);

      let shardData: Shard[] = [];

      if (idx.ceramic.did !== undefined) {
        const shardOne = await idx.ceramic.did.createDagJWE(secretShares[0], [guardians[0]]);
        const shardTwo = await idx.ceramic.did.createDagJWE(secretShares[1], [guardians[1]]);
        const shardThree = await idx.ceramic.did.createDagJWE(secretShares[2], [guardians[2]]);

        shardData = [
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
      } else {
        throw new Error('DID is undefined!');
      }

      const data: SafeData = {
        creator: creator,
        guardians: guardians,
        recipient: inheritor,
        encSafeKey: encryptedKey,
        encSafeData: encryptedData,
        stage: 0,
        encSafeKeyShards: shardData,
      };

      const safe = await conn.client.create(conn.threadId, 'Safes', [data]);

      const creatorQuery = new Where('did').eq(creator);
      const inheritorQuery = new Where('did').eq(inheritor);

      let creatorUser: User[] = await conn.client.find(conn.threadId, 'Users', creatorQuery);
      let recipientUser: User[] = await conn.client.find(conn.threadId, 'Users', inheritorQuery);

      if (creatorUser[0].safes.length === 0) {
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

      if (recipientUser[0].safes.length === 0) {
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

      if (guardianOne?.safes.length === 0) {
        guardianOne.safes = [
          {
            safeId: safe[0],
            type: 'guardian',
          },
        ];
      } else {
        guardianOne?.safes.push({
          safeId: safe[0],
          type: 'guardian',
        });
      }

      if (guardianTwo?.safes.length === 0) {
        guardianTwo.safes = [
          {
            safeId: safe[0],
            type: 'guardian',
          },
        ];
      } else {
        guardianTwo?.safes.push({
          safeId: safe[0],
          type: 'guardian',
        });
      }

      if (guardianThree?.safes.length === 0) {
        guardianThree.safes = [
          {
            safeId: safe[0],
            type: 'guardian',
          },
        ];
      } else {
        guardianThree?.safes.push({
          safeId: safe[0],
          type: 'guardian',
        });
      }

      await conn.client.save(conn.threadId, 'Users', [creatorUser[0]]);
      await conn.client.save(conn.threadId, 'Users', [recipientUser[0]]);

      await conn.client.save(conn.threadId, 'Users', [guardianOne]);
      await conn.client.save(conn.threadId, 'Users', [guardianTwo]);
      await conn.client.save(conn.threadId, 'Users', [guardianThree]);

      return safe[0];
    } catch (err) {
      throw new Error(err);
    }
  };

  getSafeData = async (conn: Connection, safeId: string): Promise<SafeData> => {
    try {
      const query = new Where('_id').eq(safeId);
      const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);

      return result[0];
    } catch (err) {
      throw new Error(err);
    }
  };

  claimSafe = async (conn: Connection, safeId: string): Promise<boolean> => {
    try {
      const query = new Where('_id').eq(safeId);
      const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);

      if (result[0].stage === 0) {
        result[0].stage = 1;
      }

      await conn.client.save(conn.threadId, 'Safes', [result[0]]);

      return true;
    } catch (err) {
      throw new Error(err);
    }
  };

  decryptShards = async (conn: Connection, idx: IDX, safeId: string, shard: number): Promise<boolean> => {
    try {
      const query = new Where('_id').eq(safeId);
      const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);

      if (result[0].stage === 1) {
        result[0].stage = 2;
      }

      if (idx.ceramic.did !== undefined) {
        const decShard = await idx.ceramic.did.decryptDagJWE(result[0].encSafeKeyShards[shard].encShard);
        result[0].encSafeKeyShards[shard].status = 1;
        result[0].encSafeKeyShards[shard].decData = decShard;
        await conn.client.save(conn.threadId, 'Safes', [result[0]]);
        return true;
      } else {
        throw new Error('DID is undefined!');
      }
    } catch (err) {
      throw new Error(err);
    }
  };
}
