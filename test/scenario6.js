const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../dist/utils/threadDb');
const chai = require('chai');
const { writeFile } = require('fs').promises;

const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientCore } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Enums } = require('../dist/index');

describe('Scenario 6 - Creating DDay based Safe', async () => {
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId;
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;
  let disputeId;
  let admin;
  let creatorSc, beneficiarySc, guardianOneSc, guardianTwoSc, guardianThreeSc;

  const apiKey = process.env.USER_API_KEY;
  const secret = process.env.USER_API_SECRET;

  const ClaimType = {
    SignalBased: 0,
    ArbitrationBased: 1,
    DDayBased: 2,
  };

  before(async () => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    admin = await provider.getSigner(0);
    creatorSigner = await provider.getSigner(1);
    beneficiarySigner = await provider.getSigner(2);
    guardianOneSigner = await provider.getSigner(3);
    guardianTwoSigner = await provider.getSigner(4);
    guardianThreeSigner = await provider.getSigner(5);
    pseudoAccount = await provider.getSigner(6);
  });

  //Step 1: Register all users
 
  it('Should register a Creator', async () => {
    creatorSc = new SafientCore(creatorSigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    const userAddress = await creatorSigner.getAddress();
    try{
      creator = await creatorSc.loginUser();
    }catch(err){
      if(err.error.code === Errors.Errors.UserNotFound.code){
        creator = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress, false);
      }
    }
    
    try{
      const result = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress, false);
    }catch(err){
      expect(err.error.code).to.equal(11);
    }

    const loginUser = await creatorSc.getUser({ did: creator.data.did });
    expect(loginUser.data.name).to.equal('Creator');
    expect(loginUser.data.email).to.equal('creator@test.com');
  });

  it('Should register a beneficiary', async () => {
    beneficiarySc = new SafientCore(beneficiarySigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
   
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress();

    try{
      beneficiary = await beneficiarySc.loginUser();
    }catch(err){
      if(err.error.code === Errors.Errors.UserNotFound.code){
        beneficiary = await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress, false);

      }
    }


    try{
      const result = await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress, false);
    }catch(err){
      expect(err.error.code).to.equal(11);
    }


    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await beneficiarySc.getUser({ did: beneficiary.data.did });
    expect(loginUser.data.name).to.equal('beneficiary');
    expect(loginUser.data.email).to.equal('beneficiary@test.com');
  });

  it('Should register a Guardian 1', async () => {
    guardianOneSc = new SafientCore(guardianOneSigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress();
    guardianOneAddress = userAddress;

    try{
      guardianOne = await guardianOneSc.loginUser();
    }catch(err){
      if(err.error.code === Errors.Errors.UserNotFound.code){
        guardianOne =  await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress, true);
      }
    }

    try{
      const result = await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress, true);
    }catch(err){
      expect(err.error.code).to.equal(11);
    }

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianOneSc.getUser({ email: `guardianOne@test.com` });
    expect(loginUser.data.name).to.equal('Guardian 1');
    expect(loginUser.data.email).to.equal('guardianOne@test.com');
  });

  it('Should register a Guardian 2', async () => {
    guardianTwoSc = new SafientCore(guardianTwoSigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress();

    try{
      guardianTwo = await guardianTwoSc.loginUser();
    }catch(err){
      if(err.error.code === Errors.Errors.UserNotFound.code){
        guardianTwo = await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress, true);

      }
    }

    try{
      const result = await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress, true);
    }catch(err){
      expect(err.error.code).to.equal(11);
    }

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianTwoSc.getUser({ email: `guardianTwo@test.com` });
    expect(loginUser.data.name).to.equal('Guardian 2');
    expect(loginUser.data.email).to.equal('guardianTwo@test.com');
  });

  it('Should register a Guardian 3', async () => {
    guardianThreeSc = new SafientCore(
      guardianThreeSigner,
      Enums.NetworkType.localhost,
      Enums.DatabaseType.threadDB,
      apiKey,
      secret
    );
    
    const userAddress = await guardianThreeSigner.getAddress();
    try{
      guardianThree = await guardianThreeSc.loginUser();
    }catch(err){
      if(err.error.code === Errors.Errors.UserNotFound.code){
        guardianThree =  await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress, true);
      }
    }


    try{
      const result = await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress, true);
    }catch(err){
      expect(err.error.code).to.equal(11);
    }

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianThreeSc.getUser({ did: guardianThree.data.did });
    expect(loginUser.data.name).to.equal('Guardian 3');
    expect(loginUser.data.email).to.equal('guardianThree@test.com');
  });

  //should create a safe onChain and offChain
  it('Should create crypto safe with hardware wallet with DDay Based Claim', async () => {
    const instructionSafe = {
      softwareWallet: null,
      hardwareWallet: 'Instruction for hardware wallet',
    };
    const cryptoSafe = {
      data: instructionSafe,
    };
    const safeData = {
      data: cryptoSafe,
    };

    const latestBlockNumber = await provider.getBlockNumber();
    const latestBlock = await provider.getBlock(latestBlockNumber);
    const now = latestBlock.timestamp;

    const safeid = await creatorSc.createSafe(
      "DDay Safe",
      "Hardware wallet safe",
      creator.data.did,
      safeData,
      true,
      ClaimType.DDayBased,
      0,
      now + 120, // 2 mins after the safe creation
      {did:beneficiary.data.did}
    );
    safeId = safeid.data.id;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);
  });

  it('Should create a claim - Before D-Day (claim should FAIL)', async () => {
      try{
        const res = await beneficiarySc.createClaim(safeId, {}, '', '');
        disputeId = parseInt(res.data.id)
      }catch(err){
        expect(err.error.code).to.eql(209)
      }

    // check claim status
  });

  it('Should create a claim - After D-Day (claim should PASS)', async () => {
    // mine a new block after 60 seconds
    const mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 60000);
    });
    const result = await mineNewBlock;

    const res = await beneficiarySc.createClaim(safeId, {}, '', '');
    disputeId = parseInt(res.data.id)

    // check claim status
    const claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(1); // claim got Passed (after D-Day)
  });

  it('Should allow safe current owner to UPDATE the D-Day', async () => {
    let latestBlockNumber, latestBlock, now, claimResult, mineNewBlock;

    // create a new safe to updateDDay
    const instructionSafe = {
      softwareWallet: null,
      hardwareWallet: 'Instruction for hardware wallet',
    };
    const cryptoSafe = {
      data: instructionSafe,
    };
    const safeData = {
      data: cryptoSafe,
    };
    latestBlockNumber = await provider.getBlockNumber();
    latestBlock = await provider.getBlock(latestBlockNumber);
    now = latestBlock.timestamp;
    const safeid = await creatorSc.createSafe(
      "DDay Safe",
      "Hardware wallet safe",
      creator.data.did,
      safeData,
      true,
      ClaimType.DDayBased,
      0,
      now + 120, // 2 mins after the safe creation
      {did:beneficiary.data.did}
    );
    safeId = safeid.data.id;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);

    // create a claim - before D-Day (2 mins) (claim should fail)
    const res = await beneficiarySc.createClaim(safeId, {}, '', '');
    disputeId = parseInt(res.data.id)
    // check claim status
    claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(2); // claim got Failed (before D-Day)

    // update the D-Day to 60 secs from the time of updating
    latestBlockNumber = await provider.getBlockNumber();
    latestBlock = await provider.getBlock(latestBlockNumber);
    now = latestBlock.timestamp;
    await creatorSc.updateDDay(safeId, now + 60);

    // mine a new block after 10 seconds
    mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 10000);
    });
    const result1 = await mineNewBlock;

    // create a claim - before D-Day (after 10 secs but before 60 secs) (claim should fail)
    const newRes = await beneficiarySc.createClaim(safeId, {}, '', '');
    disputeId = parseInt(newRes.data.id);
    // check claim status
    claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);

    expect(claimResult).to.equal(2); // claim got Failed (before D-Day)

    // mine a new block after 50 seconds
    mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 50000);
    });
    const result2 = await mineNewBlock;

    // create a claim - after D-Day (after 60 secs) (claim should pass)
    const result = await beneficiarySc.createClaim(safeId, {}, '', '');
    disputeId = parseInt(result.data.id);
    // check claim status
    claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(1); // claim got Passed (after D-Day)
  });

  // it('Should update the stage on threadDB', async () => {
  //   const result = await beneficiarySc.syncStage(safeId);
  //   expect(result.data).to.equal(true);
  // });

  it('Should initiate recovery by guardian 1', async () => {
    const data = await guardianOneSc.reconstructSafe(safeId, guardianOne.data.did);
    expect(data.data).to.equal(true);
  });

  it('Should initiate recovery by guardian 2', async () => {
    const data = await guardianTwoSc.reconstructSafe(safeId, guardianTwo.data.did);
    expect(data.data).to.equal(true);
  });

  it('Should recover data for the beneficiary', async () => {
    const data = await beneficiarySc.recoverSafeByBeneficiary(safeId, beneficiary.data.did);
    expect(data.data.data.data.hardwareWallet).to.equal('Instruction for hardware wallet');
  });

  it('Should submit proofs for the guardians', async () => {
    const result = await guardianOneSc.incentiviseGuardians(safeId);
    expect(result).to.not.equal(false);
  });

  it('Should get the guardians reward balance', async () => {
    guardianOneRewardBalance = await guardianOneSc.getRewardBalance(guardianOneAddress);
    // const newBalance = await guardianOneSigner.getBalance();
    // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
  });
});
