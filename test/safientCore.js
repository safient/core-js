const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../middleware/services/threadDb/hub-helpers');

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientSDK } = require('../dist/index');

describe('Safient Core SDK', async () => {
  // Clean up (delete users)
  after(async () => {
    const seed = new Uint8Array(randomBytes(32));
    const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(seed));
    const client = await Client.withKeyInfo({
      key: `${process.env.USER_API_KEY}`,
      secret: `${process.env.USER_API_SECRET}`,
    });
    await client.getToken(identity);
    const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));

    // DELETE : delete user A
    const query = new Where('did').eq('DID:A');
    const result = await client.find(threadId, 'Users', query);

    if (result.length < 1) return;

    const ids = await result.map((instance) => instance._id);
    await client.delete(threadId, 'Users', ids);
  });

  it('Should register a new user', async () => {
    try {
      const seed = new Uint8Array(randomBytes(32));
      const sc = new SafientSDK(seed);
      const conn = await sc.safientCore.connectUser();

      // SUCCESS : create user A
      await sc.safientCore.registerNewUser(conn, 'DID:A', 'A', 'A@test.com', 0);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(conn, 'DID:A', 'A', 'A@test.com', 0)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const allUsers = await sc.safientCore.getAllUsers(conn, 'DID:1');
      expect(allUsers.userArray[0].name).to.equal('A');
      expect(allUsers.userArray[0].email).to.equal('A@test.com');
      expect(allUsers.userArray[0].did).to.equal('DID:A');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should get the login user', async () => {
    const seed = new Uint8Array(randomBytes(32));
    const sc = new SafientSDK(seed);
    const conn = await sc.safientCore.connectUser();

    // SUCCESS : DID:A is registered
    const loginUserA = await sc.safientCore.getLoginUser(conn, 'DID:A');
    expect(loginUserA.name).to.equal('A');
    expect(loginUserA.email).to.equal('A@test.com');
    expect(loginUserA.did).to.equal('DID:A');

    // FAILURE : DID:B is not registered
    await expect(sc.safientCore.getLoginUser(conn, 'DID:B')).to.be.rejectedWith(Error);
  });
});
