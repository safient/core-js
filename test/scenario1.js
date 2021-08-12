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

describe('Scenario 1 - Creating safe offChain', async () => {
  
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
  const apiKey = process.env.USER_API_KEY
  const secret = process.env.USER_API_SECRET


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
  
      const sc = new SafientSDK(creatorSigner, chainId);
      creator = await sc.safientCore.connectUser(apiKey, secret);
      
      const userAddress = await creatorSigner.getAddress()
      await sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress)).to.eventually.be.eql('creator@test.com already registered.')

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(creator, creator.idx.id);
      expect(loginUser.name).to.equal('Creator');
      expect(loginUser.email).to.equal('creator@test.com');
  
  });

  it('Should register a beneficiary', async () => {
    
      const sc = new SafientSDK(beneficiarySigner, chainId);
      beneficiary = await sc.safientCore.connectUser(apiKey, secret);
      // SUCCESS : create user A

      const userAddress = await beneficiarySigner.getAddress()
      await sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress)).to.eventually.be.eql('beneficiary@test.com already registered.');

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(beneficiary, beneficiary.idx.id);
      expect(loginUser.name).to.equal('beneficiary');
      expect(loginUser.email).to.equal('beneficiary@test.com');
  });


  it('Should register a Guardian 1', async () => {
      const sc = new SafientSDK(guardianOneSigner, chainId);
      guardianOne = await sc.safientCore.connectUser(apiKey, secret);
      // SUCCESS : create user A
      const userAddress = await guardianOneSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.eventually.be.eql('guardianOne@test.com already registered.');

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianOne, guardianOne.idx.id);
      expect(loginUser.name).to.equal('Guardian 1');
      expect(loginUser.email).to.equal('guardianOne@test.com');
  });

  it('Should register a Guardian 2', async () => {
      const sc = new SafientSDK(guardianTwoSigner, chainId);
      guardianTwo = await sc.safientCore.connectUser(apiKey, secret);
      // SUCCESS : create user A
      const userAddress = await guardianTwoSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.eventually.be.eql('guardianTwo@test.com already registered.');

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianTwo, guardianTwo.idx.id);
      expect(loginUser.name).to.equal('Guardian 2');
      expect(loginUser.email).to.equal('guardianTwo@test.com');
  });

  it('Should register a Guardian 3', async () => {
      const sc = new SafientSDK(guardianThreeSigner, chainId);
      guardianThree = await sc.safientCore.connectUser(apiKey, secret);
      const userAddress = await guardianThreeSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.eventually.be.eql('guardianThree@test.com already registered.');

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianThree, guardianThree.idx.id);
      expect(loginUser.name).to.equal('Guardian 3');
      expect(loginUser.email).to.equal('guardianThree@test.com');
  });

  //should create a safe onChain and offChain
  it('Should create safe with "Testing Safe data" as data offchain', async () => {
   
      const sc = new SafientSDK(creatorSigner, chainId);
      safeId = await sc.safientCore.createNewSafe(creator, creator.idx.id, beneficiary.idx.id, "Testing safe Data", false)
      const safeData = await sc.safientCore.getSafeData(creator, safeId);
      expect(safeData.creator).to.equal(creator.idx.id);
  });


  //Step 3: Create a claim
  it('Should create a claim', async () => {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const file = {
        name: "signature.jpg"
      }
      disputeId = await sc.safientCore.claimSafe(beneficiary, safeId, file, "Testing Evidence", "Lorsem Text")
      console.log(disputeId);
      expect(disputeId).to.be.a('number');
  });

  it('Should PASS the dispute', async () => {
      const sc = new SafientSDK(admin, chainId);
      const result = await sc.safientCore.giveRuling(disputeId, 1) //Passing a claim
      expect(result).to.equal(true);
  });

  it('Should update the stage on threadDB', async () => {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const result = await sc.safientCore.syncStage(beneficiary, safeId)
      expect(result).to.equal(true);
  });

 

  it('Should initiate recovery by guardian 1', async () => {
      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.guardianRecovery(guardianOne, safeId, guardianOne.idx.id)
      expect(data).to.equal(true);
  });

  it('Should initiate recovery by guardian 2', async () => {

      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.guardianRecovery(guardianTwo, safeId, guardianTwo.idx.id)
      expect(data).to.equal(true);
  });


  it('Should recover data for the beneficiary', async () => {
      const sc = new SafientSDK(pseudoAccount, chainId);
      const data = await sc.safientCore.recoverData(beneficiary, safeId, beneficiary.idx.id)
      console.log(data.data);
      expect(data.data).to.equal('Testing safe Data');
  });



  it('Should incentivise the guardians', async () => {
   
      const sc = new SafientSDK(guardianOneSigner, chainId);
      const prevBalance = await guardianOneSigner.getBalance();
      const safeData = await sc.safientCore.incentiviseGuardians(guardianOne, safeId);
      const newBalance = await guardianOneSigner.getBalance();
      expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
    
  });
});
