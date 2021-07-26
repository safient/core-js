const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../dist/utils/threadDb');
const fs = require('fs')
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientSDK } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { SignatureKind } = require('typescript');

describe('Safient SDK Test Part 2', async () => {
  
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId = "01fazbj4kk9p5y8tgkz704ysz6";
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;


  before(async() => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    creatorSigner = await provider.getSigner(1);
    
    beneficiarySigner = await provider.getSigner(2);
    guardianOneSigner = await provider.getSigner(3);
    guardianTwoSigner = await provider.getSigner(4);
    guardianThreeSigner = await provider.getSigner(5);
    pseudoAccount = await provider.getSigner(6)
  })
  //Step 1: Register all users
  it('Should get the updated stage ', async () => {
    try {
      // const seed = new Uint8Array(randomBytes(32));
      const sc = new SafientSDK(creatorSigner, chainId);
      creator = await sc.safientCore.connectUser();
      console.log(creator.idx.id)
      // SUCCESS : create user A
      
      const userAddress = await creatorSigner.getAddress()
      await sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress)).to.be.ok

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(creator, creator.idx.id);
      expect(loginUser.name).to.equal('Creator');
      expect(loginUser.email).to.equal('creator@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a beneficiary', async () => {
    try {

      const sc = new SafientSDK(beneficiarySigner, chainId);
      beneficiary = await sc.safientCore.connectUser();
      // SUCCESS : create user A

      const userAddress = await beneficiarySigner.getAddress()
      console.log(userAddress)
      await sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(beneficiary, beneficiary.idx.id);
      expect(loginUser.name).to.equal('beneficiary');
      expect(loginUser.email).to.equal('beneficiary@test.com');
    } catch (e) {
      console.log(e);
    }
  });


  it('Should register a Guardian 1', async () => {
    try {

      const sc = new SafientSDK(guardianOneSigner, chainId);
      guardianOne = await sc.safientCore.connectUser();
      // SUCCESS : create user A
      const userAddress = await guardianOneSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianOne, guardianOne.idx.id);
      expect(loginUser.name).to.equal('Guardian 1');
      expect(loginUser.email).to.equal('guardianOne@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a Guardian 2', async () => {
    try {
      const sc = new SafientSDK(guardianTwoSigner, chainId);
      guardianTwo = await sc.safientCore.connectUser();
      // SUCCESS : create user A
      const userAddress = await guardianTwoSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianTwo, guardianTwo.idx.id);
      expect(loginUser.name).to.equal('Guardian 2');
      expect(loginUser.email).to.equal('guardianTwo@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a Guardian 3', async () => {
    try {
      const sc = new SafientSDK(guardianThreeSigner, chainId);
      guardianThree = await sc.safientCore.connectUser();

      const userAddress = await guardianThreeSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianThree, guardianThree.idx.id);
      expect(loginUser.name).to.equal('Guardian 3');
      expect(loginUser.email).to.equal('guardianThree@test.com');

    } catch (e) {
      console.log(e);
    }
  });

 
  //Step 3: Create a claim
  it('Should update the stage on threadDB', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
     
      const result = await sc.safientCore.syncStage(beneficiary, safeId)
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });

  // //Step 4: Recover Safes


  it('Should initiate recovery by guardian 1', async () => {
    try {
      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.guardianRecovery(guardianOne, safeId, guardianOne.idx.id)
    } catch (e) {
      console.log(e);
    }
  });

  it('Should initiate recovery by guardian 2', async () => {
    try {
      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.guardianRecovery(guardianTwo, safeId, guardianTwo.idx.id)
    } catch (e) {
      console.log(e);
    }
  });


  it('Should recover data for the beneficiary', async () => {
    try {
      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.recoverData(beneficiary, safeId, beneficiary.idx.id)
    } catch (e) {
      console.log(e);
    }
  });



  it('Should incentivise the guardians', async () => {
    try {

      const sc = new SafientSDK(guardianOneSigner, chainId);
      const safeData = await sc.safientCore.incentiviseGuardians(guardianOne, safeId);
      const balance = await guardianOneSigner.getBalance();
      console.log(parseInt(balance._hex));
    } catch (e) {
      console.log(e);
    }
  });

  

  //Incentivise safes

  // it('Should delete all users', async () => {
  //   const seed = new Uint8Array(randomBytes(32));
  //     const sc = new SafientSDK(seed);
  //     connection = await sc.safientCore.connectUser();
  //     let client = connection.client;
  //     const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
     
  //     const userEmails = ['creator@test.com', 'beneficiary@test.com', 'guardianOne@test.com', 'guardianTwo@test.com', 'guardianThree@test.com']
     
  //     const creatorQuery = new Where('email').eq(userEmails[0]);;
  //     const creatorResult = await client.find(threadId, 'Users', creatorQuery);
     
  //     const inhertorQuery = new Where('email').eq(userEmails[1]);;
  //     const inhertorResult = await client.find(threadId, 'Users', inhertorQuery);

  //     const guardianOneQuery = new Where('email').eq(userEmails[2]);;
  //     const guardianOneResult = await client.find(threadId, 'Users', guardianOneQuery);

  //     const guardianTwoQuery = new Where('email').eq(userEmails[3]);;
  //     const guardianTwoResult = await client.find(threadId, 'Users', guardianTwoQuery);

  //     const guardianThreeQuery = new Where('email').eq(userEmails[4]);;
  //     const guardianThreeResult = await client.find(threadId, 'Users', guardianThreeQuery);

  //     await client.delete(threadId, 'Users', [creatorResult[0]._id, inhertorResult[0]._id], guardianOneResult[0]._id, guardianTwoResult[0]._id, guardianThreeResult[0]._id);

  //     const allUsers = await sc.safientCore.getAllUsers(connection);
  //     console.log(allUsers);
      
  // })
});
