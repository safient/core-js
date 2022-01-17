const { ThreadID } = require('@textile/hub');
const { SafientClaims } = require('@safient/contracts');
const { utils } = require('ethers');
const { getThreadId } = require('../dist/utils/threadDb');
const fs = require('fs');
const chai = require('chai');

const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { SafientCore } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Enums } = require('../dist/index');

describe('Scenario 3 - Creating safe onChain and Passed the dispute', async () => {
  let admin;
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId;
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;
  let disputeId;
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

  describe('Safe creation and claim creation', async () => {
    describe('Onchain', async () => {
      it('Should Create Crypto Safe with software wallet instructions', async () => {
        const instructionSafe = {
          softwareWallet: 'Instruction for software wallet',
          hardwareWallet: null,
        };
        const cryptoSafe = {
          data: instructionSafe,
        };
        const safeData = {
          data: cryptoSafe,
        };

        const safeid = await creatorSc.createSafe(
          creator.data.did,
          beneficiary.data.did,
          safeData,
          true,
          ClaimType.ArbitrationBased,
          0,
          0
        );
        safeId = safeid.data;
        const safe = await creatorSc.getSafe(safeId);
        expect(safe.data.creator).to.equal(creator.data.did);
      });

      it('Should claim safe', async () => {
        const file = {
          name: 'signature.jpg',
        };
        disputeId = await beneficiarySc.createClaim(safeId, file, 'Testing Evidence', 'Lorsem Text');
        expect(disputeId.data).to.be.a('number');
      });
    });
  });

  describe('Ruling...', async () => {
    it('Should PASS ruling on the dispute', async () => {
      const sc = new SafientCore(admin, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret, null);

      const result = await sc.giveRuling(disputeId.data, 1); //Passing a claim
      expect(result.data).to.equal(true);
    });
  });

  // describe('Sync safe stage', async () => {
  //   it('Updates the safe stage on threadDB according to the ruling', async () => {
  //     const result = await beneficiarySc.syncStage(safeId);
  //     expect(result.data).to.equal(true);
  //   });
  // });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {
      const data = await guardianOneSc.reconstructSafe(safeId, guardianOne.data.did);
      expect(data.data).to.equal(true);
    });

    it('Recovery done by guardian 2', async () => {
      const data = await guardianTwoSc.reconstructSafe(safeId, guardianTwo.data.did);
      expect(data.data).to.equal(true);
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {
      const data = await beneficiarySc.recoverSafeByBeneficiary(safeId, beneficiary.data.did);
      expect(data.data.data.data.softwareWallet).to.equal('Instruction for software wallet');
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Should submit proofs for the guardians', async () => {
      const result = await guardianOneSc.incentiviseGuardians(safeId);
      expect(result.data).to.not.equal(false);
    });

    it('Should get the guardians reward balance', async () => {
      guardianOneRewardBalance = await guardianOneSc.getRewardBalance(guardianOneAddress);
      // const newBalance = await guardianOneSigner.getBalance();
      // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
    });
  });
});
