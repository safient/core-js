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

describe('Scenario 8 - Creating expiration based safe', async () => {
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
    Expiration: 3,
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

    guardianOneAddress = await guardianOneSigner.getAddress();

    safient = new SafientCore(Enums.NetworkType.localhost);
  });

//Step 1: Register all users
it('Should register a Creator', async () => {
    
  try{
    creator = await safient.createUser(creatorSigner, {name: 'Creator', email: 'creator@test.com'});
  }catch(err){
    if(err.error.code === Errors.UserAlreadyExists.code){
      creator = await safient.loginUser(creatorSigner);
    }
  }
  
  try{
    const result = await safient.createUser(creatorSigner, {name: 'Creator', email: 'creator@test.com'});
  }catch(err){
    expect(err.error.code).to.equal(Errors.UserAlreadyExists.code);
  }

  const loginUser = await safient.getUser({ did: creator.data.did });
  expect(loginUser.data.name).to.equal('Creator');
  expect(loginUser.data.email).to.equal('creator@test.com');
});

it('Should register a beneficiary', async () => {

  try{
    beneficiary = await safient.createUser(beneficiarySigner, { name: 'beneficiary', email: 'beneficiary@test.com'});
  }catch(err){
    
    if(err.error.code === Errors.UserAlreadyExists.code){
      beneficiary = await safient.loginUser(beneficiarySigner);

    }
  }

  const loginUser = await safient.getUser({ did: beneficiary.data.did });
  expect(loginUser.data.name).to.equal('beneficiary');
  expect(loginUser.data.email).to.equal('beneficiary@test.com');
});

it('Should register a Guardian 1', async () => {

  try{
    guardianOne =  await safient.createUser(guardianOneSigner, {name: 'Guardian 1', email: 'guardianOne@test.com'}, true);
    
  }catch(err){
    if(err.error.code === Errors.UserAlreadyExists.code){
      guardianOne = await safient.loginUser(guardianOneSigner);
    }
  }

  const loginUser = await safient.getUser({ email: `guardianOne@test.com` });
  expect(loginUser.data.name).to.equal('Guardian 1');
  expect(loginUser.data.email).to.equal('guardianOne@test.com');
});

it('Should register a Guardian 2', async () => {

  try{
    guardianTwo = await safient.createUser(guardianTwoSigner, {name: 'Guardian 2', email: 'guardianTwo@test.com'}, true);
  }catch(err){
    if(err.error.code === Errors.UserAlreadyExists.code){
      guardianTwo = await safient.loginUser(guardianTwoSigner);

    }
  }

  const loginUser = await safient.getUser({ email: `guardianTwo@test.com` });
  expect(loginUser.data.name).to.equal('Guardian 2');
  expect(loginUser.data.email).to.equal('guardianTwo@test.com');
});

it('Should register a Guardian 3', async () => {
  
  try{
    
    guardianThree =  await safient.createUser(guardianThreeSigner, {name: 'Guardian 3', email: 'guardianThree@test.com'}, true);
  }
  catch(err){
    if(err.error.code === Errors.UserAlreadyExists.code){
      guardianThree = await safient.loginUser(guardianThreeSigner);
     
  }
}

  const loginUser = await safient.getUser({ did: guardianThree.data.did });
  expect(loginUser.data.name).to.equal('Guardian 3');
  expect(loginUser.data.email).to.equal('guardianThree@test.com');
});

  //should create a safe onChain and offChain
  it('Should create Crypto safe with private key as data offchain using expiration claim', async () => {
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

    await safient.loginUser(creatorSigner);

    const safeid = await safient.createSafe(
      safeData,
      {did:beneficiary.data.did},
      {type: ClaimType.Expiration, period: 6},
      { name: "Offchain Safient voucher - expiration based",
       description:  "Safient voucher key"}
    );
    safeId = safeid.data.id;
    const safe = await safient.getSafe(safeId);
    expect(safe.data.creator).to.equal(creator.data.did);
  });

  it('Should recover data for the beneficiary', async () => {

    await safient.loginUser(beneficiarySigner);
    const data = await safient.recoverSafeByBeneficiary(safeId, beneficiary.data.did);
    expect(data.data.data.data.privateKey).to.equal('0x81993E3b09f9ee1a5a8e5c59c9CF1411E5Bd28ea');
  });

});
