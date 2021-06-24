const { SafientSDK } = require('../dist/index');
const { randomBytes } = require('crypto');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('SafientSDK', async () => {
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
    await expect(sc.safientCore.getLoginUser(conn, 'DID:D')).to.be.rejectedWith(Error);
  });
});
