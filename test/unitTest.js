const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../dist/utils/threadDb');
const chai = require('chai');
const { writeFile } = require('fs').promises;

const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientCore } = require('../dist/index');
const { Enums } = require('../dist/index');
const {Errors} = require('../dist/index')
const { JsonRpcProvider } = require('@ethersproject/providers');
const { SignatureKind } = require('typescript');

describe('Unit test', async () => {
  let admin;
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId;
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner, randomUserSigner;
  let disputeId;
  let creatorSc, beneficiarySc, guardianOneSc, guardianTwoSc, guardianThreeSc;
  let guardianOneAddress;
  let guardianOneRewardBalance;
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
    randomUserSigner = await provider.getSigner(7)
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

  it('Should create a new Crypto Safe with Seed phrase', async () => {
    const secretSafe = {
      seedPhrase: 'index negative film salon crumble wish rebuild seed betray meadow next ability',
      privateKey: null,
      keyStore: null,
    };
    const cryptoSafe = {
      data: secretSafe,
    };
    const safeData = {
      data: cryptoSafe,
    };
    const safeid = await creatorSc.createSafe(
      "On Chain Unit test",
      "Crytpo safe with seed phrase",
      creator.data.did,
      beneficiary.data.did,
      safeData,
      true,
      ClaimType.ArbitrationBased,
      0,
      0
    );
    safeId = safeid.data.id;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);
  });

  //Step 3: Create a claim
  it('Should create a claim', async () => {
    const file = {
      name: 'signature.jpg',
    };
    const result = await beneficiarySc.createClaim(safeId, file, 'Testing Evidence', 'Lorsem Text');
    disputeId = result.data.id
    expect(disputeId).to.be.a('string');
  });

  it('Should give Ruling for the dispute', async () => {
    const sc = new SafientCore(admin, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);

    const result = await sc.giveRuling(parseInt(disputeId), 1); //Passing a claim
    expect(result.data).to.equal(true);
  });

  // it('Should update the stage on threadDB', async () => {
  //   const result = await beneficiarySc.syncStage(safeId);
  //   expect(result.data).to.equal(true);
  // });

  // //Step 4: Recover Safes

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
    expect(data.data.data.data.seedPhrase).to.equal(
      'index negative film salon crumble wish rebuild seed betray meadow next ability'
    );
  });

  it('Should submit proofs for the guardians', async () => {
    const result = await guardianOneSc.incentiviseGuardians(safeId);
    expect(result.data).to.not.equal(false);
  });

  it('Should get the guardians reward balance', async () => {
    guardianOneRewardBalance = await guardianOneSc.getRewardBalance(guardianOneAddress);
    // const newBalance = await guardianOneSigner.getBalance();
    // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
  });

  it('Should claim rewards for the guardian One', async () => {
    const prevBalance = await guardianOneSigner.getBalance();
    const result = await guardianOneSc.claimRewards(guardianOneRewardBalance.data);
    const newBalance = await guardianOneSigner.getBalance();
    expect(parseInt(newBalance) > parseInt(prevBalance)).to.equal(true);
  });
});
