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
const { Errors } = require('../dist/index')
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
  let safient;
  let guardianOneAddress;
  let guardianOneRewardBalance;

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

    const loginUser = await safient.getUser({ did: guardianThree.data.did });
    expect(loginUser.data.name).to.equal('Guardian 3');
    expect(loginUser.data.email).to.equal('guardianThree@test.com');
  });

  it('Should create a new Crypto Safe with Seed phrase', async () => {

    creator = await safient.loginUser(creatorSigner);
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
    const safeid = await safient.createSafe(
      "On Chain Unit test",
      "Crytpo safe with seed phrase",
      creator.data.did,
      safeData,
      ClaimType.ArbitrationBased,
      0,
      0,
      {email: 'beneficiary@test.com'}
    );
    safeId = safeid.data.id;
    const safe = await safient.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);
    expect(safe.data.safeName).to.equal("On Chain Unit test")
  });

  //Step 3: Create a claim
  it('Should create a claim', async () => {

    beneficiary = await safient.loginUser(beneficiarySigner);
    const file = {
      name: 'signature.jpg',
    };
    const result = await safient.createClaim(safeId, file, 'Testing Evidence', 'Lorsem Text');
    disputeId = result.data.id
    expect(disputeId).to.be.a('string');
  });

  it('Should give Ruling for the dispute', async () => {

    try {
      await safient.loginUser(admin)
    }
    catch {
      // Exception for admin user
      
    }
    const result = await safient.giveRuling(parseInt(disputeId), 1); //Passing a claim
    expect(result.data).to.equal(true);
  });

  // it('Should update the stage on threadDB', async () => {
  //   const result = await safient.syncStage(safeId);
  //   expect(result.data).to.equal(true);
  // });

  // //Step 4: Recover Safes

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
    expect(data.data.data.data.seedPhrase).to.equal(
      'index negative film salon crumble wish rebuild seed betray meadow next ability'
    );
  });

  it('Should submit proofs for the guardians', async () => {

    await safient.loginUser(guardianOneSigner);
    const result = await safient.incentiviseGuardians(safeId);
    expect(result.data).to.not.equal(false);
  });

  it('Should get the guardians reward balance', async () => {
    guardianOneRewardBalance = await safient.getRewardBalance(guardianOneAddress);
    const newBalance = await guardianOneSigner.getBalance();
    expect(guardianOneRewardBalance)
  });

  it('Should claim rewards for the guardian One', async () => {

    await safient.loginUser(guardianOneSigner);
    const prevBalance = await guardianOneSigner.getBalance();
    const result = await safient.claimRewards(guardianOneRewardBalance.data);
    const newBalance = await guardianOneSigner.getBalance();
    expect(parseInt(newBalance) > parseInt(prevBalance)).to.equal(true);
  });
});
