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

describe('Scenario 5 - Creating signal based Safe', async () => {
  
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
  let creatorSc, beneficiarySc, guardianOneSc, guardianTwoSc, guardianThreeSc;

  const apiKey = process.env.USER_API_KEY
  const secret = process.env.USER_API_SECRET

  const ClaimType = {
    SignalBased: 0,
    ArbitrationBased: 1
  }

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
  
    creatorSc = new SafientSDK(creatorSigner, chainId, 'threadDB');
    creator = await creatorSc.safientCore.connectUser(apiKey, secret);
    
    const userAddress = await creatorSigner.getAddress()
    await creatorSc.safientCore.registerNewUser('Creator', 'creator@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(creatorSc.safientCore.registerNewUser('Creator', 'creator@test.com', 0, userAddress)).to.eventually.be.eql('creator@test.com already registered.')

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await creatorSc.safientCore.getLoginUser(creator.idx.id);
    expect(loginUser.name).to.equal('Creator');
    expect(loginUser.email).to.equal('creator@test.com');

});

it('Should register a beneficiary', async () => {
  
    beneficiarySc = new SafientSDK(beneficiarySigner, chainId, 'threadDB');
    beneficiary = await beneficiarySc.safientCore.connectUser(apiKey, secret);
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress()
    await beneficiarySc.safientCore.registerNewUser('beneficiary', 'beneficiary@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(beneficiarySc.safientCore.registerNewUser('beneficiary', 'beneficiary@test.com', 0, userAddress)).to.eventually.be.eql('beneficiary@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await beneficiarySc.safientCore.getLoginUser(beneficiary.idx.id);
    expect(loginUser.name).to.equal('beneficiary');
    expect(loginUser.email).to.equal('beneficiary@test.com');
});


it('Should register a Guardian 1', async () => {
    guardianOneSc = new SafientSDK(guardianOneSigner, chainId, 'threadDB');
    guardianOne = await guardianOneSc.safientCore.connectUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress()
    await guardianOneSc.safientCore.registerNewUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianOneSc.safientCore.registerNewUser('Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.eventually.be.eql('guardianOne@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianOneSc.safientCore.getLoginUser(guardianOne.idx.id);
    expect(loginUser.name).to.equal('Guardian 1');
    expect(loginUser.email).to.equal('guardianOne@test.com');
});

it('Should register a Guardian 2', async () => {
    guardianTwoSc = new SafientSDK(guardianTwoSigner, chainId, 'threadDB');
    guardianTwo = await guardianTwoSc.safientCore.connectUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress()
    await guardianTwoSc.safientCore.registerNewUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianTwoSc.safientCore.registerNewUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.eventually.be.eql('guardianTwo@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianTwoSc.safientCore.getLoginUser(guardianTwo.idx.id);
    expect(loginUser.name).to.equal('Guardian 2');
    expect(loginUser.email).to.equal('guardianTwo@test.com');
});

it('Should register a Guardian 3', async () => {
    guardianThreeSc = new SafientSDK(guardianThreeSigner, chainId, 'threadDB');
    guardianThree = await guardianThreeSc.safientCore.connectUser(apiKey, secret);

    const userAddress = await guardianThreeSigner.getAddress()
    await guardianThreeSc.safientCore.registerNewUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianThreeSc.safientCore.registerNewUser('Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.eventually.be.eql('guardianThree@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianThreeSc.safientCore.getLoginUser(guardianThree.idx.id);
    expect(loginUser.name).to.equal('Guardian 3');
    expect(loginUser.email).to.equal('guardianThree@test.com');
});

  //should create a safe onChain and offChain
  it('Should create safe with "Testing Safe data" with Signal Based Claim', async () => {
     
      safeId = await creatorSc.safientCore.createNewSafe(creator.idx.id, beneficiary.idx.id, "Testing safe Data", true, ClaimType.SignalBased, 10)
      const safeData = await creatorSc.safientCore.getSafeData(safeId);
      expect(safeData.creator).to.equal(creator.idx.id);
  });


  //Step 3: Create a claim
  it('Should create a claim', async () => {
    const file = {
        name: "signature.jpg"
    }
    disputeId = await beneficiarySc.safientCore.claimSafe(safeId, file, "Testing Evidence", "Lorsem Text")
    expect(disputeId).to.be.a('number');
  });

  it('Should send signal after claim', async () => {

      const result = await creatorSc.safientCore.sendSignal(safeId) //Passing a claim
      expect(result.status).to.equal(1);
  });


  it('Should update the stage on threadDB', async () => {
      const result = await beneficiarySc.safientCore.syncStage(safeId)
      expect(result).to.equal(true);
  });


  it('Should try recovery by guardian 1', async () => {
      const data = await guardianOneSc.safientCore.guardianRecovery(safeId, guardianOne.idx.id)
      expect(data).to.equal(false);

  });

  it('Should try recovery by guardian 2', async () => {

      const data = await guardianTwoSc.safientCore.guardianRecovery(safeId, guardianTwo.idx.id)
      expect(data).to.equal(false);

  });


  it('Should try data for the beneficiary', async () => {
    const data = await beneficiarySc.safientCore.beneficiarySafeRecovery(safeId, beneficiary.idx.id)      
    expect(data).to.equal(undefined);


  });
});
