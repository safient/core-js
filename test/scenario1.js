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

describe('Scenario 1 - Creating safe offChain', async () => {
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
    creator = await creatorSc.loginUser();
    const userAddress = await creatorSigner.getAddress();
    if (creator.status === false) {
      const res = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress);
    } else if (creator.status === true) {
      expect(creator.data.email).to.equal('creator@test.com');
    }

    const result = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress);
    expect(result.error.message).to.equal(`creator@test.com already registered.`);

    const loginUser = await creatorSc.getUser({ did: creator.idx.id });
    expect(loginUser.data.name).to.equal('Creator');
    expect(loginUser.data.email).to.equal('creator@test.com');
  });

  it('Should register a beneficiary', async () => {
    beneficiarySc = new SafientCore(beneficiarySigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    beneficiary = await beneficiarySc.loginUser();
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress();
    if (beneficiary.status === false) {
      await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress);
    } else if (beneficiary.status === true) {
      expect(beneficiary.data.email).to.equal('beneficiary@test.com');
    }

    const result = await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress);
    expect(result.error.message).to.equal(`beneficiary@test.com already registered.`);

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await beneficiarySc.getUser({ did: beneficiary.idx.id });
    expect(loginUser.data.name).to.equal('beneficiary');
    expect(loginUser.data.email).to.equal('beneficiary@test.com');
  });

  it('Should register a Guardian 1', async () => {
    guardianOneSc = new SafientCore(guardianOneSigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    guardianOne = await guardianOneSc.loginUser();
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress();
    guardianOneAddress = userAddress;

    if (guardianOne.status === false) {
      await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);
    } else {
      expect(guardianOne.data.email).to.equal('guardianOne@test.com');
    }

    const result = await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);
    expect(result.error.message).to.equal(`guardianOne@test.com already registered.`);

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianOneSc.getUser({ email: `guardianOne@test.com` });
    expect(loginUser.data.name).to.equal('Guardian 1');
    expect(loginUser.data.email).to.equal('guardianOne@test.com');
  });

  it('Should register a Guardian 2', async () => {
    guardianTwoSc = new SafientCore(guardianTwoSigner, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    guardianTwo = await guardianTwoSc.loginUser();
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress();

    if (guardianTwo.status === false) {
      await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);
    } else {
      expect(guardianTwo.data.email).to.equal('guardianTwo@test.com');
    }

    const result = await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);
    expect(result.error.message).to.equal(`guardianTwo@test.com already registered.`);

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
    guardianThree = await guardianThreeSc.loginUser();

    const userAddress = await guardianThreeSigner.getAddress();
    if (guardianThree.status === false) {
      await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);
    } else {
      expect(guardianThree.data.email).to.equal('guardianThree@test.com');
    }

    const result = await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);
    expect(result.error.message).to.equal(`guardianThree@test.com already registered.`);

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianThreeSc.getUser({ did: guardianThree.idx.id });
    expect(loginUser.data.name).to.equal('Guardian 3');
    expect(loginUser.data.email).to.equal('guardianThree@test.com');
  });

  //should create a safe onChain and offChain
  it('Should create Crypto safe with private key as data offchain', async () => {
    const secretSafe = {
      seedPhrase: null,
      privateKey: '0x81993E3b09f9ee1a5a8e5c59c9CF1411E5Bd28ea',
      keyStore: null,
    };
    const cryptoSafe = {
      data: secretSafe,
    };
    const safeData = {
      data: cryptoSafe,
    };
    const safeid = await creatorSc.createSafe(
      creator.idx.id,
      beneficiary.idx.id,
      safeData,
      false,
      ClaimType.ArbitrationBased,
      0,
      0
    );
    safeId = safeid.safeId;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.idx.id);
  });

  //Step 3: Create a claim
  it('Should create a claim', async () => {
    const file = {
      name: 'signature.jpg',
    };
    disputeId = await beneficiarySc.createClaim(safeId, file, 'Testing Evidence', 'Lorsem Text');
    expect(disputeId).to.be.a('number');
  });

  it('Should PASS the dispute', async () => {
    const sc = new SafientCore(admin, Enums.NetworkType.localhost, Enums.DatabaseType.threadDB, apiKey, secret);
    const result = await sc.giveRuling(disputeId, 1); //Passing a claim
    expect(result).to.equal(true);
  });

  it('Should update the stage on threadDB', async () => {
    const result = await beneficiarySc.syncStage(safeId);
    expect(result).to.equal(true);
  });

  it('Should initiate recovery by guardian 1', async () => {
    const data = await guardianOneSc.reconstructSafe(safeId, guardianOne.idx.id);
    expect(data).to.equal(true);
  });

  it('Should initiate recovery by guardian 2', async () => {
    const data = await guardianTwoSc.reconstructSafe(safeId, guardianTwo.idx.id);
    expect(data).to.equal(true);
  });

  it('Should recover data for the beneficiary', async () => {
    const data = await beneficiarySc.recoverSafeByBeneficiary(safeId, beneficiary.idx.id);
    expect(data.data.data.data.privateKey).to.equal('0x81993E3b09f9ee1a5a8e5c59c9CF1411E5Bd28ea');
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
