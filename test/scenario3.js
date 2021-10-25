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
    creator = await creatorSc.loginUser(apiKey, secret);
    const userAddress = await creatorSigner.getAddress()
    if(creator.status === false){
      const res = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress);
    }
    else if(creator.status === true){
      expect(creator.data.email).to.equal('creator@test.com')
    }

    const result = await creatorSc.createUser('Creator', 'creator@test.com', 0, userAddress);
    expect(result.error).to.equal(`creator@test.com already registered.`)

    const loginUser = await creatorSc.getUser(creator.idx.id, '');
    expect(loginUser.name).to.equal('Creator');
    expect(loginUser.email).to.equal('creator@test.com');

});

it('Should register a beneficiary', async () => {
  
    beneficiarySc = new SafientCore(beneficiarySigner, chainId, 'threadDB');
    beneficiary = await beneficiarySc.loginUser(apiKey, secret);
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress()
    if(beneficiary.status ===  false){
      await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress);
    }else if(beneficiary.status === true){
      expect(beneficiary.data.email).to.equal('beneficiary@test.com')
    }

    const result = await beneficiarySc.createUser('beneficiary', 'beneficiary@test.com', 0, userAddress);
    expect(result.error).to.equal(`beneficiary@test.com already registered.`)

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await beneficiarySc.getUser(beneficiary.idx.id, '');
    expect(loginUser.name).to.equal('beneficiary');
    expect(loginUser.email).to.equal('beneficiary@test.com');
});


it('Should register a Guardian 1', async () => {
    guardianOneSc = new SafientCore(guardianOneSigner, chainId, 'threadDB');
    guardianOne = await guardianOneSc.loginUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress()
    guardianOneAddress = userAddress

    if(guardianOne.status === false){
      await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);
    }else{
      expect(guardianOne.data.email).to.equal('guardianOne@test.com');
    }

    const result =  await guardianOneSc.createUser('Guardian 1', 'guardianOne@test.com', 0, userAddress);
    expect(result.error).to.equal(`guardianOne@test.com already registered.`)

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianOneSc.getUser(guardianOne.idx.id, '');
    expect(loginUser.name).to.equal('Guardian 1');
    expect(loginUser.email).to.equal('guardianOne@test.com');
});

it('Should register a Guardian 2', async () => {
    guardianTwoSc = new SafientCore(guardianTwoSigner, chainId, 'threadDB');
    guardianTwo = await guardianTwoSc.loginUser(apiKey, secret);
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress()

    if(guardianTwo.status === false){
      await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);
    }else{
      expect(guardianTwo.data.email).to.equal('guardianTwo@test.com');

    }

    const result =  await guardianTwoSc.createUser('Guardian 2', 'guardianTwo@test.com', 0, userAddress);
    expect(result.error).to.equal(`guardianTwo@test.com already registered.`)

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianTwoSc.getUser(guardianTwo.idx.id, '');
    expect(loginUser.name).to.equal('Guardian 2');
    expect(loginUser.email).to.equal('guardianTwo@test.com');
});

it('Should register a Guardian 3', async () => {
    guardianThreeSc = new SafientCore(guardianThreeSigner, chainId, 'threadDB');
    guardianThree = await guardianThreeSc.loginUser(apiKey, secret);

    const userAddress = await guardianThreeSigner.getAddress()
    if(guardianThree.status === false){
      await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);
    }else{
      expect(guardianThree.data.email).to.equal('guardianThree@test.com');
    }

    const result =  await guardianThreeSc.createUser('Guardian 3', 'guardianThree@test.com', 0, userAddress);
    expect(result.error).to.equal(`guardianThree@test.com already registered.`)


    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await guardianThreeSc.getUser(guardianThree.idx.id, '');
    expect(loginUser.name).to.equal('Guardian 3');
    expect(loginUser.email).to.equal('guardianThree@test.com');
});

  describe('Safe creation and claim creation', async () => {
    describe('Onchain', async () => {
      it('Should Create Safe', async () => {
      
          const userAddress = await creatorSigner.getAddress()

          safeId = await creatorSc.createSafe(
            creator.idx.id,
            beneficiary.idx.id,
            'This is a test data',
            true,
            ClaimType.ArbitrationBased,
            0
          );

          // check safe - threadDB
          const safeDataThreadDB = await creatorSc.getSafe(safeId);
          expect(safeDataThreadDB.creator).to.equal(creator.idx.id);

          // // check safe - onchain (since this is an onChain=true safe creation)
          // const safeData = await creatorSc..getSafeData(safeId);
          //  expect(safeData.creator).to.equal(creator.idx.id);
        
      });

      it('Should claim safe', async () => {
      

          const file = {
            name: 'signature.jpg',
          };

          disputeId = await beneficiarySc.createClaim(
            safeId,
            file,
            'Test evidence',
            'This is an evidence description'
          );

          // check claim on the safe - threadDB
          const safeDataThreadDB = await beneficiarySc.getSafe(safeId);
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
        const safeDataThreadDB = await beneficiarySc.getSafe(safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
        expect(safeDataThreadDB.claims[0].claimStatus).to.equal(1); // claimStages.PASSED      
      
    });
  });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {
   

        const result = await guardianOneSc.reconstructSafe(safeId, guardianOne.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should still be in RECOVERING stage)
        const safeDataThreadDB = await guardianOneSc.getSafe(safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
     
    });

    it('Recovery done by guardian 2', async () => {
     

        const result = await guardianTwoSc.reconstructSafe(safeId, guardianTwo.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should be in RECOVERED stage)
        const safeDataThreadDB = await guardianTwoSc.getSafe(safeId);
        expect(safeDataThreadDB.stage).to.equal(3); // safeStages.RECOVERED
      
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {
     

        const data = await beneficiarySc.recoverSafeByBeneficiary(safeId, beneficiary.idx.id)

        expect(data.data).to.equal('This is a test data');
      
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Should submit proofs for the guardians', async () => {
   
        const result = await guardianOneSc.incentiviseGuardians(safeId);
        expect(result).to.not.equal(false)
        
       
      });
    
      it('Should get the guardians reward balance', async () => {
       
       guardianOneRewardBalance = await guardianOneSc.getRewardBalance(guardianOneAddress);
        // const newBalance = await guardianOneSigner.getBalance();
        // expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
       
      });
    });
});
