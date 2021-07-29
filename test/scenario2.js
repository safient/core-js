const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../dist/utils/threadDb');
const chai = require('chai');
const { writeFile } = require('fs').promises

const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientSDK } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');

describe('Scenario 2 - Creating safe onChain and Failing the dispute', async () => {
  
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId;
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;
  let disputeId
  let admin


  before(async() => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    admin = await provider.getSigner(0);
    creatorSigner = await provider.getSigner(1);
    beneficiarySigner = await provider.getSigner(2);
    guardianOneSigner = await provider.getSigner(3);
    guardianTwoSigner = await provider.getSigner(4);
    guardianThreeSigner = await provider.getSigner(5);
    pseudoAccount = await provider.getSigner(6)
  })
  //Step 1: Register all users
  it('Should register a Creator', async () => {
    try {
      // const seed = new Uint8Array(randomBytes(32));
      const sc = new SafientSDK(creatorSigner, chainId);
      creator = await sc.safientCore.connectUser();
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

  //should create a safe onChain and offChain
  it('Should create safe with "Testing Safe data" as data onChain', async () => {
    try {
      const sc = new SafientSDK(creatorSigner, chainId);
      safeId = await sc.safientCore.createNewSafe(creator, beneficiary, creator.idx.id, beneficiary.idx.id, "Testing safe Data", true)
      const safeData = await sc.safientCore.getSafeData(creator, safeId);
      expect(safeData.creator).to.equal(creator.idx.id);
    } catch (e) {
      console.log(e);
    }
  });


  //Step 3: Create a claim
  it('Should create a Claim 1', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const file = {
        name: "signature.jpg"
      }
      disputeId = await sc.safientCore.claimSafe(beneficiary, safeId, file, "Testing Evidence", "Lorsem Text")
      expect(disputeId).to.be.a('number');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should try to create another claim', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const file = {
        name: "signature.jpg"
      }
      disputeId = await sc.safientCore.claimSafe(beneficiary, safeId, file, "Testing Evidence", "Lorsem Text")
    } catch (e) {
      console.log(e);
    }
  });

  it('Should FAIL the dispute on Claim 1', async () => {
    try {
      const sc = new SafientSDK(admin, chainId);

      const result = await sc.safientCore.giveRuling(disputeId, 2) //Passing a claim
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });

  it('Should update the stage on threadDB', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
     
      const result = await sc.safientCore.syncStage(beneficiary, safeId)
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });

  it('Should try to create Claim 2', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const file = {
        name: "signature.jpg"
      }
      disputeId = await sc.safientCore.claimSafe(beneficiary, safeId, file, "Testing Evidence", "Lorsem Text")
    } catch (e) {
      console.log(e);
    }
  });

  it('Should PASS the dispute on Claim 2', async () => {
    try {
      const sc = new SafientSDK(admin, chainId);

      const result = await sc.safientCore.giveRuling(disputeId, 1) //Passing a claim
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });

  it('Should update the stage on threadDB', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
     
      const result = await sc.safientCore.syncStage(beneficiary, safeId)
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });



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
      const prevBalance = await guardianOneSigner.getBalance();
      const safeData = await sc.safientCore.incentiviseGuardians(guardianOne, safeId);
      const newBalance = await guardianOneSigner.getBalance();
      expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });
});
