const { ThreadID } = require('@textile/hub');
const { utils } = require('ethers');
const { getThreadId } = require('../dist/utils/threadDb');
const fs = require('fs');
const chai = require('chai');

const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { SafientCore } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Enums, Errors } = require('../dist/index');

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
  let safient;


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


    // SUCCESS : get all users (check if the user A was created)
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


    // SUCCESS : get all users (check if the user A was created)
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
    // SUCCESS : get all users (check if the user A was created)
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

        await safient.loginUser(creatorSigner);

        const safeid = await safient.createSafe(
          safeData,
          {did:beneficiary.data.did},
          {type: ClaimType.ArbitrationBased},
          { name: "On chain safe",
           description:  "Software Wallet"}
        );
        safeId = safeid.data.id;
        const safe = await safient.getSafe(safeId);
        expect(safe.data.creator).to.equal(creator.data.did);
      });

      it('Should claim safe', async () => {
        const file = {
          name: 'signature.jpg',
        };
        await safient.loginUser(beneficiarySigner);
        const res = await safient.createClaim(safeId, { file: file, evidenceName: 'Testing Evidence', description: 'Lorsem Text' });
        disputeId = parseInt(res.data.id)
        expect(disputeId).to.be.a('number');
      });
    });
  });

  describe('Ruling...', async () => {
    it('Should PASS ruling on the dispute', async () => {

      try {
        await safient.loginUser(admin)
      }
      catch {
        // Exception for admin user
        
      }

      const result = await safient.giveRuling(disputeId, 1); //Passing a claim
      expect(result.data).to.equal(true);
    });
  });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {

      await safient.loginUser(guardianOneSigner)
      const data = await safient.reconstructSafe(safeId, guardianOne.data.did);
      expect(data.data).to.equal(true);
    });

    it('Recovery done by guardian 2', async () => {

      await safient.loginUser(guardianTwoSigner)
      const data = await safient.reconstructSafe(safeId, guardianTwo.data.did);
      expect(data.data).to.equal(true);
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {

      await safient.loginUser(beneficiarySigner)
      const data = await safient.recoverSafeByBeneficiary(safeId, beneficiary.data.did);
      expect(data.data.data.data.softwareWallet).to.equal('Instruction for software wallet');
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Should submit proofs for the guardians', async () => {

      await safient.loginUser(guardianOneSigner)
      const result = await safient.incentiviseGuardians(safeId);
      expect(result.data).to.not.equal(false);
    });

    it('Should get the guardians reward balance', async () => {

      await safient.loginUser(guardianOneSigner)
      guardianOneRewardBalance = await safient.getRewardBalance(guardianOneAddress);
      // const newBalance = await guardianOneSigner.getBalance();
      // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
    });
  });
});
