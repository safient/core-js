const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../dist/utils/threadDb');
const chai = require('chai');
const { writeFile } = require('fs').promises

const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientCore } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');

describe('Scenario 4 - Creating signal based Safe', async () => {
  
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
  
    creatorSc = new SafientCore(creatorSigner, chainId, 'threadDB');
    creator = await creatorSc.connectUser(apiKey, secret);
    
    const userAddress = await creatorSigner.getAddress()
    await creatorSc.registerNewUser('Creator', 'creator@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(creatorSc.registerNewUser('Creator', 'creator@test.com', 0, userAddress)).to.eventually.be.eql('creator@test.com already registered.')

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await creatorSc.getLoginUser(creator.idx.id);
    expect(loginUser.name).to.equal('Creator');
    expect(loginUser.email).to.equal('creator@test.com');


});

it('Should register a beneficiary', async () => {
  
    beneficiarySc = new SafientCore(beneficiarySigner, chainId, 'threadDB');
    beneficiary = await beneficiarySc.connectUser(apiKey, secret);
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress()
    await beneficiarySc.registerNewUser('beneficiary', 'beneficiary@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(beneficiarySc.registerNewUser('beneficiary', 'beneficiary@test.com', 0, userAddress)).to.eventually.be.eql('beneficiary@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await beneficiarySc.getLoginUser(beneficiary.idx.id);
    expect(loginUser.name).to.equal('beneficiary');
    expect(loginUser.email).to.equal('beneficiary@test.com');
});


it('Should register a Guardian 1', async () => {
    guardianOneSc = new SafientCore(guardianOneSigner, chainId, 'threadDB');
    guardianOne = await guardianOneSc.connectUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress()
    await guardianOneSc.registerNewUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianOneSc.registerNewUser('Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.eventually.be.eql('guardianOne@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianOneSc.getLoginUser(guardianOne.idx.id);
    expect(loginUser.name).to.equal('Guardian 1');
    expect(loginUser.email).to.equal('guardianOne@test.com');
});

it('Should register a Guardian 2', async () => {
    guardianTwoSc = new SafientCore(guardianTwoSigner, chainId, 'threadDB');
    guardianTwo = await guardianTwoSc.connectUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress()
    await guardianTwoSc.registerNewUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianTwoSc.registerNewUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.eventually.be.eql('guardianTwo@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianTwoSc.getLoginUser(guardianTwo.idx.id);
    expect(loginUser.name).to.equal('Guardian 2');
    expect(loginUser.email).to.equal('guardianTwo@test.com');
});

it('Should register a Guardian 3', async () => {
    guardianThreeSc = new SafientCore(guardianThreeSigner, chainId, 'threadDB');
    guardianThree = await guardianThreeSc.connectUser(apiKey, secret);

    const userAddress = await guardianThreeSigner.getAddress()
    await guardianThreeSc.registerNewUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(guardianThreeSc.registerNewUser('Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.eventually.be.eql('guardianThree@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianThreeSc.getLoginUser(guardianThree.idx.id);
    expect(loginUser.name).to.equal('Guardian 3');
    expect(loginUser.email).to.equal('guardianThree@test.com');
});

  //should create a safe onChain and offChain
  it('Should create safe with "Testing Safe data" with Signal Based Claim', async () => {
   
     
      safeId = await creatorSc.createNewSafe(creator.idx.id, beneficiary.idx.id, "Testing safe Data", true, ClaimType.SignalBased, 6)
      const safeData = await creatorSc.getSafeData(safeId);
      expect(safeData.creator).to.equal(creator.idx.id);
  });


  //Step 3: Create a claim
  it('Should create a claim', async () => {
    const file = {
        name: "signature.jpg"
    }
    disputeId = await beneficiarySc.claimSafe(safeId, file, "Testing Evidence", "Lorsem Text")
    expect(disputeId).to.be.a('number');
  });

  it('Should send signal after claim', async () => {

      const result = await creatorSc.sendSignal(safeId)
      expect(result.status).to.equal(1);
  });

  it('Should create a claim', async () => {
    const file = {
        name: "signature.jpg"
    }
    disputeId = await beneficiarySc.claimSafe(safeId, file, "Testing Evidence", "Lorsem Text")
    const mineNewBlock = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(provider.send('evm_mine'));
        }, 7000);
      });
      const result = await mineNewBlock;
    expect(disputeId).to.be.a('number');
  });

  it('Should update the stage on threadDB', async () => {
      const result = await beneficiarySc.syncStage(safeId)
      expect(result).to.equal(true);
  });

 

  it('Should initiate recovery by guardian 1', async () => {
      const data = await guardianOneSc.guardianRecovery(safeId, guardianOne.idx.id)
      expect(data).to.equal(true);
  });

  it('Should initiate recovery by guardian 2', async () => {

      const data = await guardianTwoSc.guardianRecovery(safeId, guardianTwo.idx.id)
      expect(data).to.equal(true);
  });


  it('Should recover data for the beneficiary', async () => {
    const data = await beneficiarySc.beneficiarySafeRecovery(safeId, beneficiary.idx.id)     
      expect(data.data).to.equal('Testing safe Data');
  });



  it('Should incentivise the guardians', async () => {
   
      const prevBalance = await guardianOneSigner.getBalance();
      const safeData = await guardianOneSc.incentiviseGuardians(safeId);
      const newBalance = await guardianOneSigner.getBalance();
      expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
    
  });
});
