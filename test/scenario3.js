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
    let disputeId
    let creatorSc, beneficiarySc, guardianOneSc, guardianTwoSc, guardianThreeSc;

    const apiKey = process.env.USER_API_KEY
    const secret = process.env.USER_API_SECRET

    const ClaimType = {
      SignalBased: 0,
      ArbitrationBased: 1
    }

  before(async () => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    admin = await provider.getSigner(0)
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

  describe('Safe creation and claim creation', async () => {
    describe('Onchain', async () => {
      it('Should Create Safe', async () => {
      
          const userAddress = await creatorSigner.getAddress()

          safeId = await creatorSc.createNewSafe(
            creator.idx.id,
            beneficiary.idx.id,
            'This is a test data',
            true,
            ClaimType.ArbitrationBased,
            0
          );

          // check safe - threadDB
          const safeDataThreadDB = await creatorSc.getSafeData(safeId);
          expect(safeDataThreadDB.creator).to.equal(creator.idx.id);

          // // check safe - onchain (since this is an onChain=true safe creation)
          // const safeData = await creatorSc..getSafeData(safeId);
          //  expect(safeData.creator).to.equal(creator.idx.id);
        
      });

      it('Should claim safe', async () => {
      

          const file = {
            name: 'signature.jpg',
          };

          disputeId = await beneficiarySc.claimSafe(
            safeId,
            file,
            'Test evidence',
            'This is an evidence description'
          );

          // check claim on the safe - threadDB
          const safeDataThreadDB = await beneficiarySc.getSafeData(safeId);
          expect(safeDataThreadDB.claims[0].createdBy).to.equal(beneficiary.idx.id);
          expect(safeDataThreadDB.claims[0].disputeId).to.equal(disputeId);
          expect(safeDataThreadDB.claims[0].claimStatus).to.equal(0); // claimStages.ACTIVE
          expect(safeDataThreadDB.stage).to.equal(1); // safeStages.CLAIMING
          expect(safeDataThreadDB.beneficiary).to.equal(beneficiary.idx.id);
       
      });
    });
  });

  describe('Ruling...', async () => {
    it('Should PASS ruling on the dispute', async () => {
     
        const sc = new SafientCore(admin, chainId);

        const result = await sc.giveRuling(disputeId, 1) //Passing a claim
        expect(result).to.equal(true);
     
    });
  });


  describe('Sync safe stage', async () => {
    it('Updates the safe stage on threadDB according to the ruling', async () => {
 
     
        const result = await beneficiarySc.syncStage(safeId)
        expect(result).to.equal(true);

        // check safe - threadDB
        const safeDataThreadDB = await beneficiarySc.getSafeData(safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
        expect(safeDataThreadDB.claims[0].claimStatus).to.equal(1); // claimStages.PASSED      
      
    });
  });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {
   

        const result = await guardianOneSc.guardianRecovery(safeId, guardianOne.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should still be in RECOVERING stage)
        const safeDataThreadDB = await guardianOneSc.getSafeData(safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
     
    });

    it('Recovery done by guardian 2', async () => {
     

        const result = await guardianTwoSc.guardianRecovery(safeId, guardianTwo.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should be in RECOVERED stage)
        const safeDataThreadDB = await guardianTwoSc.getSafeData(safeId);
        expect(safeDataThreadDB.stage).to.equal(3); // safeStages.RECOVERED
      
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {
     

        const data = await beneficiarySc.beneficiarySafeRecovery(safeId, beneficiary.idx.id)

        expect(data.data).to.equal('This is a test data');
      
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Guardian 1 and guardian 2 are incentivised', async () => {
      
        const prevBalance = await guardianOneSigner.getBalance();
        const result = await guardianOneSc.incentiviseGuardians(safeId);
        const newBalance = await guardianOneSigner.getBalance();
        expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
      
    });
  });
});
