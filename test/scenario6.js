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
const { Enums, Errors } = require('../dist/index');

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

    safient = new SafientCore(Enums.NetworkType.localhost);
  });

  //Step 1: Register all users
 
  it('Should register a Creator', async () => {

    const userAddress = await creatorSigner.getAddress();
    try{
      creator = await safient.loginUser(creatorSigner);
    }catch(err){
      if(err.error.code === Errors.UserNotFound.code){
        creator = await safient.createUser('Creator', 'creator@test.com', 0, userAddress, false);
      }
    }
    
    try{
      const result = await safient.createUser('Creator', 'creator@test.com', 0, userAddress, false);
    }catch(err){
      expect(err.error.code).to.equal(Errors.UserAlreadyExists.code);
    }

    const loginUser = await safient.getUser({ did: creator.data.did });
    expect(loginUser.data.name).to.equal('Creator');
    expect(loginUser.data.email).to.equal('creator@test.com');
  });

  it('Should register a beneficiary', async () => {

    const userAddress = await beneficiarySigner.getAddress();

    try{
      beneficiary = await safient.loginUser(beneficiarySigner);
    }catch(err){
      if(err.error.code === Errors.UserNotFound.code){
        beneficiary = await safient.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress, false);

      }
    }

    // SUCCESS : get all users (check if the user was created)
    const loginUser = await safient.getUser({ did: beneficiary.data.did });
    expect(loginUser.data.name).to.equal('beneficiary');
    expect(loginUser.data.email).to.equal('beneficiary@test.com');
  });

  it('Should register a Guardian 1', async () => {

    const userAddress = await guardianOneSigner.getAddress();
    guardianOneAddress = userAddress;

    try{
      guardianOne = await safient.loginUser(guardianOneSigner);
    }catch(err){
      if(err.error.code === Errors.UserNotFound.code){
        guardianOne =  await safient.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress, true);
      }
    }


    // SUCCESS : get all users (check if the user was created)
    const loginUser = await safient.getUser({ email: `guardianOne@test.com` });
    expect(loginUser.data.name).to.equal('Guardian 1');
    expect(loginUser.data.email).to.equal('guardianOne@test.com');
  });

  it('Should register a Guardian 2', async () => {
 
    const userAddress = await guardianTwoSigner.getAddress();

    try{
      guardianTwo = await safient.loginUser(guardianTwoSigner);
    }catch(err){
      if(err.error.code === Errors.UserNotFound.code){
        guardianTwo = await safient.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress, true);
      }
    }

    // SUCCESS : get all users (check if the user was created)
    const loginUser = await safient.getUser({ email: `guardianTwo@test.com` });
    expect(loginUser.data.name).to.equal('Guardian 2');
    expect(loginUser.data.email).to.equal('guardianTwo@test.com');
  });

  it('Should register a Guardian 3', async () => {

    const userAddress = await guardianThreeSigner.getAddress();
    try{
      guardianThree = await safient.loginUser(guardianThreeSigner);
    }catch(err){
      if(err.error.code === Errors.UserNotFound.code){
        guardianThree =  await safient.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress, true);
      }
    }

    // SUCCESS : get all users (check if the user was created)
    const loginUser = await safient.getUser({ did: guardianThree.data.did });
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


    await safient.loginUser(creatorSigner);

    const safeid = await safient.createSafe(
      "DDay Safe",
      "Hardware wallet safe",
      creator.data.did,
      safeData,
      ClaimType.DDayBased,
      0,
      60, // 1 mins after the safe creation
      {did:beneficiary.data.did},
      true
    );
    safeId = safeid.data.id;
    const safe = await safient.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);
  });

  it('Should create a claim - Before D-Day (claim should FAIL)', async () => {
      try{
        await safient.loginUser(beneficiarySigner);
        const res = await safient.createClaim(safeId, {}, '', '');
        disputeId = parseInt(res.data.id)
      }catch(err){
        expect(err.error.code).to.eql(Errors.ClaimNotCreated.code)
      }

  });

  it('Should create a claim - After D-Day (claim should PASS)', async () => {
    // mine a new block after 60 seconds
    const mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 60000);
    });
    const result = await mineNewBlock;

    await safient.loginUser(beneficiarySigner);
    const res = await safient.createClaim(safeId, {}, '', '');
    disputeId = parseInt(res.data.id)

    // check claim status
    const claimResult = await safient.getClaimStatus(safeId, disputeId);
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
    
    await safient.loginUser(creatorSigner);
    const safeid = await safient.createSafe(
      "DDay Safe",
      "Hardware wallet safe",
      creator.data.did,
      safeData,
      ClaimType.DDayBased,
      0,
      60, // 1 mins after the safe creation
      {did:beneficiary.data.did},
      true
    );
    safeId = safeid.data.id;
    const safe = await safient.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);

    // create a claim - before D-Day (1 min) (claim should fail)
    try{
      await safient.loginUser(beneficiarySigner);
      const res = await safient.createClaim(safeId, {}, '', '');
      disputeId = parseInt(res.data.id)
    }catch(err){
      expect(err.error.code).to.eql(Errors.ClaimNotCreated.code)
    }

    // update the D-Day to 60 secs from the time of updating
    latestBlockNumber = await provider.getBlockNumber();
    latestBlock = await provider.getBlock(latestBlockNumber);
    now = latestBlock.timestamp;
    await safient.loginUser(creatorSigner);
    await safient.updateDDay(safeId, now + 60);

    // mine a new block after 10 seconds
    mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 10000);
    });
    const result1 = await mineNewBlock;

    // create a claim - before D-Day (after 10 secs but before 60 secs) (claim should fail)
    try{
      await safient.loginUser(beneficiarySigner);
      const res = await safient.createClaim(safeId, {}, '', '');
      disputeId = parseInt(res.data.id)
    }catch(err){
      expect(err.error.code).to.eql(Errors.ClaimNotCreated.code)
    }

    // mine a new block after 50 seconds
    mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 50000);
    });
    const result2 = await mineNewBlock;

    // create a claim - after D-Day (after 60 secs) (claim should pass)
    const result = await safient.createClaim(safeId, {}, '', '');
    disputeId = parseInt(result.data.id);
    // check claim status
    claimResult = await safient.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(1); // claim got Passed (after D-Day)
  });

  // it('Should update the stage on threadDB', async () => {
  //   const result = await beneficiarySc.syncStage(safeId);
  //   expect(result.data).to.equal(true);
  // });

  it('Should initiate recovery by guardian 1', async () => {

    await safient.loginUser(guardianOneSigner);
    const data = await safient.reconstructSafe(safeId, guardianOne.data.did);
    expect(data.data).to.equal(true);
  });

  it('Should initiate recovery by guardian 2', async () => {

    await safient.loginUser(guardianTwoSigner);
    const data = await safient.reconstructSafe(safeId, guardianTwo.data.did);
    expect(data.data).to.equal(true);
  });

  it('Should recover data for the beneficiary', async () => {

    await safient.loginUser(beneficiarySigner);
    const data = await safient.recoverSafeByBeneficiary(safeId, beneficiary.data.did);
    expect(data.data.data.data.hardwareWallet).to.equal('Instruction for hardware wallet');
  });

  it('Should submit proofs for the guardians', async () => {

    await safient.loginUser(guardianOneSigner);
    const result = await safient.incentiviseGuardians(safeId);
    expect(result).to.not.equal(false);
  });

  it('Should get the guardians reward balance', async () => {

    await safient.loginUser(guardianOneSigner);
    guardianOneRewardBalance = await safient.getRewardBalance(guardianOneAddress);
    // const newBalance = await guardianOneSigner.getBalance();
    // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
  });
});
