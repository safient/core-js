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
    const loginUser = await guardianOneSc.getUser({ did: guardianOne.idx.id });
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
    const loginUser = await guardianTwoSc.getUser({ did: guardianTwo.idx.id });
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
      creator.idx.id,
      beneficiary.idx.id,
      safeData,
      true,
      ClaimType.DDayBased,
      0,
      now + 120 // 2 mins after the safe creation
    );
    safeId = safeid.safeId;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.idx.id);
  });

  it('Should create a claim - Before D-Day (claim should FAIL)', async () => {
    disputeId = await beneficiarySc.createClaim(safeId, {}, '', '');

    // check claim status
    const claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(2); // claim got Failed (before D-Day)
  });

  it('Should create a claim - After D-Day (claim should PASS)', async () => {
    // mine a new block after 60 seconds
    const mineNewBlock = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(provider.send('evm_mine'));
      }, 60000);
    });
    const result = await mineNewBlock;

    disputeId = await beneficiarySc.createClaim(safeId, {}, '', '');

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
      creator.idx.id,
      beneficiary.idx.id,
      safeData,
      true,
      ClaimType.DDayBased,
      0,
      now + 120 // 2 mins after the safe creation
    );
    safeId = safeid.safeId;
    const safe = await creatorSc.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.idx.id);

    // create a claim - before D-Day (2 mins) (claim should fail)
    disputeId = await beneficiarySc.createClaim(safeId, {}, '', '');
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
    disputeId = await beneficiarySc.createClaim(safeId, {}, '', '');
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
    disputeId = await beneficiarySc.createClaim(safeId, {}, '', '');
    // check claim status
    claimResult = await beneficiarySc.getClaimStatus(safeId, disputeId);
    expect(claimResult).to.equal(1); // claim got Passed (after D-Day)
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
